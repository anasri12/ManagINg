import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { registerUser } from "@/app/utils/auth";
import { queryDatabase } from "@/app/utils/db";
import { UserSchema } from "@/app/zods/db/user";
import { QueryUserSchema } from "@/app/zods/query";
import { UserFields } from "@/app/utils/mapfields/user";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
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
    const params: any[] = [];

    if (filters.role) {
      conditions.push("Role = ?");
      params.push(filters.role);
    }

    if (filters.username) {
      conditions.push("Username LIKE ?");
      params.push(`%${filters.username}%`);
    }

    if (filters.email) {
      conditions.push("Email = ?");
      params.push(filters.email);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `SELECT ${selectClause} FROM User ${whereClause}`;

    console.log("SQL Query:", sql);
    console.log("Query Params:", params);

    const users = await queryDatabase<any>(sql, params);
    console.log("Database Results:", users);

    if (!Array.isArray(users)) {
      throw new Error("Unexpected query result: Expected an array, but got a ResultSetHeader.");
    }

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsedData = UserSchema["post"].parse(body);

    const { username, email, password } = parsedData;
    const userId = await registerUser(username, email, password, null);

    return NextResponse.json(
      { message: "User created successfully", userId },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error adding user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
