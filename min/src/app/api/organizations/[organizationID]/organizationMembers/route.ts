import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { OrganizationMemberFields } from "@/app/utils/mapfields/organization";
import { OrganizationMemberSchema } from "@/app/zods/db/organizationMember";
import { QueryOrganizationMemberSchema } from "@/app/zods/query";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isMemberOfOrganization } from "../../utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(await isMemberOfOrganization(params.organizationID, session.user.id))
    ) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      id: searchParams.get("id"),
      role: searchParams.get("role"),
      fields: searchParams.get("fields"),
    };

    console.log("Query Parameters:", queryParams);

    const filters = QueryOrganizationMemberSchema.parse(queryParams);

    const selectedFields = filters.fields
      ? filters.fields.split(",").map((field) => field.trim())
      : OrganizationMemberFields;

    console.log("Selected Fields:", selectedFields);

    const invalidFields = selectedFields.filter(
      (field) => !OrganizationMemberFields.includes(field)
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

    const selectClause = selectedFields.join(", ");

    const conditions: string[] = [];
    const filter_params: any[] = [];

    conditions.push("Organization_Code = ?");
    filter_params.push(params.organizationID);

    if (filters.id) {
      conditions.push("ID = ?");
      filter_params.push(filters.id);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `SELECT ${selectClause} FROM Organization_Member ${whereClause}`;

    console.log("SQL Query:", sql);
    console.log("Query Params:", filter_params);

    const groupMembers = await queryDatabase<any[]>(sql, filter_params);
    console.log("Database Results:", groupMembers);

    if (!Array.isArray(groupMembers)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }

    const validatedUsers = selectedFields.includes("*")
      ? groupMembers.map((groupMember) =>
          OrganizationMemberSchema["full"].parse(groupMember)
        )
      : groupMembers.map((groupMember) => {
          const schema = OrganizationMemberSchema["full"];
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
            .parse(groupMember);
        });

    return NextResponse.json(validatedUsers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { organizationID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Ensure the session user is authorized
    if (
      !session ||
      !(await isMemberOfOrganization(params.organizationID, session.user.id))
    ) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();

    // Validate the request body using the appropriate schema
    const parsedBody = OrganizationMemberSchema["post"].parse(body);

    // Check if the user to be added exists
    const sqlCheckUser = `SELECT COUNT(*) AS count FROM User WHERE ID = ?`;
    const userCheckResult = (await queryDatabase(sqlCheckUser, [
      parsedBody.User_ID,
    ])) as { count: number }[];

    if (!userCheckResult[0] || userCheckResult[0].count === 0) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    // Check if the user is already a member of the organization
    const sqlCheckMembership = `
      SELECT COUNT(*) AS count
      FROM Organization_Member
      WHERE User_ID = ? AND Organization_Code = ?
    `;
    const membershipCheckResult = (await queryDatabase(sqlCheckMembership, [
      parsedBody.User_ID,
      params.organizationID,
    ])) as { count: number }[];

    if (membershipCheckResult[0] && membershipCheckResult[0].count > 0) {
      return NextResponse.json(
        { message: "User is already a member of the organization" },
        { status: 400 }
      );
    }

    // Insert the new member into the Organization_Member table
    const sqlInsertMember = `
      INSERT INTO Organization_Member (User_ID, Organization_Code, Role, JoinedAt)
      VALUES (?, ?, ?, NOW())
    `;
    const result = await queryDatabase(sqlInsertMember, [
      parsedBody.User_ID,
      params.organizationID,
      parsedBody.Role,
    ]);

    if (Array.isArray(result) || result.affectedRows === 0) {
      throw new Error("Failed to add user to the organization.");
    }

    return NextResponse.json({
      message: "User added to the organization successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error adding user to organization:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
