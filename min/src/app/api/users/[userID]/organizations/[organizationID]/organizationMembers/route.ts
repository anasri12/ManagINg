import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { OrganizationMemberFields } from "@/app/utils/mapfields/organization";
import { OrganizationMemberSchema } from "@/app/zods/db/organizationMember";
import { QueryOrganizationMemberSchema } from "@/app/zods/query";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string; organizationID: number } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
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

    if (filters.role) {
      conditions.push("Role = ?");
      filter_params.push(filters.role);
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
