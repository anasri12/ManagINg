import { z } from "zod";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { UserIDSchema } from "@/app/zods/params";
import { UserSchema } from "@/app/zods/db/user";
import { QueryUserSchema } from "@/app/zods/query";
import { UserFields } from "@/app/utils/fields";

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
    const queryParams = {
      role: searchParams.get("role"),
      username: searchParams.get("username"),
      email: searchParams.get("email"),
      fields: searchParams.get("fields"),
    };

    console.log("Query Parameters:", queryParams);

    const filters = QueryUserSchema.parse(queryParams);

    const selectedFields = filters.fields
      ? filters.fields.split(",").map((field) => field.trim())
      : UserFields;

    console.log("Selected Fields:", selectedFields);

    const invalidFields = selectedFields.filter(
      (field) => !UserFields.includes(field)
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

    conditions.push("ID = ?");
    filter_params.push(params.userID);

    if (filters.role) {
      conditions.push("Role = ?");
      filter_params.push(filters.role);
    }

    if (filters.username) {
      conditions.push("Username LIKE ?");
      filter_params.push(`%${filters.username}%`);
    }

    if (filters.email) {
      conditions.push("Email = ?");
      filter_params.push(filters.email);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `SELECT ${selectClause} FROM User ${whereClause}`;

    console.log("SQL Query:", sql);
    console.log("Query Params:", filter_params);

    const users = await queryDatabase<any[]>(sql, filter_params);
    console.log("Database Results:", users);

    const validatedUsers = selectedFields.includes("*")
      ? users.map((user) => UserSchema["full"].parse(user))
      : users.map((user) => {
          const schema = UserSchema["full"];
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
            .parse(user);
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    UserIDSchema.parse(params);

    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();

    const parsedBody = UserSchema["patch"].parse(body);

    if (!parsedBody || Object.keys(parsedBody).length === 0) {
      return NextResponse.json(
        { message: "No data provided for update" },
        { status: 400 }
      );
    }

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(parsedBody)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    values.push(params.userID);

    const sql = `
      UPDATE User
      SET ${fields.join(", ")}
      WHERE ID = ?
    `;

    await db.query(sql, values);

    return NextResponse.json({ message: "User updated successfully" });
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: validationError.errors },
        { status: 400 }
      );
    }

    console.error("Unexpected error:", validationError);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
