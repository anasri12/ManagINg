import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import {
  OrganizationWithMemberFields,
  OrganizationWithMemberMaps,
} from "@/app/utils/mapfields/organization";
import { OrganizationSchema } from "@/app/zods/db/organization";
import { QueryOnlySchema } from "@/app/zods/query";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const queryParams = { fields: searchParams.get("fields") };

    console.log("Query Parameters:", queryParams);

    const filters = QueryOnlySchema.parse(queryParams);

    const selectedFields = filters.fields
      ? filters.fields.split(",").map((field) => field.trim())
      : OrganizationWithMemberFields;

    console.log("Selected Fields:", selectedFields);

    const invalidFields = selectedFields.filter(
      (field) => !OrganizationWithMemberFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return NextResponse.json(
        {
          message: "Invalid fields specified",
          invalidFields,
        },
        { status: 400 }
      );
    }

    const prefixedFields = selectedFields.map(
      (field) => `${OrganizationWithMemberMaps[field]}.${field}`
    );

    console.log("Prefixed Fields:", prefixedFields);

    const conditions: string[] = [];
    const filter_params: any[] = [];

    conditions.push("gm.User_ID = ?");
    filter_params.push(params.userID);

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const selectClause = prefixedFields.join(", ");

    const sql = `
        SELECT ${selectClause}
        FROM Organization g
        INNER JOIN Organization_Member gm ON g.Code = gm.Organization_Code
        ${whereClause}`;

    console.log("SQL Query:", sql);
    console.log("Query Params:", filter_params);

    const groups = await queryDatabase<any[]>(sql, filter_params);
    console.log("Database Results:", groups);

    if (!Array.isArray(groups)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }

    const validatedGroups = selectedFields.includes("*")
      ? groups.map((group) => OrganizationSchema["full"].parse(group))
      : groups.map((group) => {
          const schema = OrganizationSchema["full"];
          return z
            .object(
              selectedFields.reduce((acc, field) => {
                if (field in schema.shape) {
                  acc[field as keyof typeof schema.shape] =
                    schema.shape[field as keyof typeof schema.shape];
                }
                return acc;
              }, {} as z.ZodRawShape)
            )
            .parse(group);
        });

    return NextResponse.json(validatedGroups);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();

    // Validate the request body using the appropriate schema
    const parsedBody = OrganizationSchema["post"].parse(body);

    // Generate a unique 20-character alphanumeric code for the organization
    const generateOrganizationCode = () => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 20; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let organizationCode = generateOrganizationCode();

    // Ensure the code is unique by checking the database
    let isUnique = false;
    const sqlCheckCode = `SELECT COUNT(*) AS count FROM Organization WHERE Code = ?`;

    while (!isUnique) {
      const result = (await queryDatabase(sqlCheckCode, [
        organizationCode,
      ])) as { count: number }[];

      if (result[0]?.count === 0) {
        isUnique = true;
      } else {
        organizationCode = generateOrganizationCode();
      }
    }

    // Insert the organization into the database
    const sqlInsertOrganization = `
        INSERT INTO Organization (Code, Name, Description, CreatedAt, UpdatedAt)
        VALUES (?, ?, ?, NOW(), NOW())
      `;

    const result = await queryDatabase(sqlInsertOrganization, [
      organizationCode,
      parsedBody.Name,
      parsedBody.Description,
    ]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      throw new Error("Failed to insert organization.");
    }

    return NextResponse.json({
      message: "Organization created successfully",
      organizationCode: organizationCode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating organization:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
