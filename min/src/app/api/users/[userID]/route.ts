import { z } from "zod";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { UserIDSchema } from "@/app/zods/params";
import { UserInterface, UserSchema } from "@/app/zods/db/user";
import { QueryUserSchema } from "@/app/zods/query";
import { UserFields } from "@/app/utils/mapfields/user";

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(session.user.role === "Admin" || session.user.id === params.userID)
    ) {
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
    const filter_params: unknown[] = [];

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

    const users = await queryDatabase(sql, filter_params);
    console.log("Database Results:", users);

    if (!Array.isArray(users)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    // Parse and validate user ID
    const userID = params.userID;
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(session.user.role === "Admin" || session.user.id === userID)
    ) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const { Current_Password, Password, ...updateFields } =
      UserSchema["patch"].parse(body);

    if (Object.keys(updateFields).length === 0 && !Password) {
      return NextResponse.json(
        { message: "No fields provided for update." },
        { status: 400 }
      );
    }

    // Fetch the current password hash
    const fetchPasswordSql = `SELECT Password_Hash FROM User WHERE ID = ?`;
    const user = await queryDatabase<UserInterface["full"]>(fetchPasswordSql, [
      userID,
    ]);

    if (!Array.isArray(user) || user.length === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const { Password_Hash } = user[0];

    // Verify current password if Password update is requested
    if (Password && !Current_Password) {
      return NextResponse.json(
        { message: "Current password is required to update the password." },
        { status: 400 }
      );
    }

    if (Password && Current_Password) {
      const isPasswordValid = await bcrypt.compare(
        Current_Password,
        Password_Hash
      );
      if (!isPasswordValid) {
        return NextResponse.json(
          { message: "Current password is incorrect." },
          { status: 403 }
        );
      }
      // Hash the new password for update
      updateFields["Password_Hash"] = await bcrypt.hash(Password, 10);
    }

    // Dynamically prepare the update SQL
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateFields)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    values.push(userID);

    const sql = `
      UPDATE User
      SET ${fields.join(", ")}, UpdatedAt = NOW()
      WHERE ID = ?
    `;

    await queryDatabase(sql, values);

    return NextResponse.json({ message: "User updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    UserIDSchema.parse(params);

    const session = await getServerSession(authOptions);

    if (
      !session ||
      !(session.user.role === "Admin" || session.user.id === params.userID)
    ) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `DELETE FROM User WHERE ID = ?`;
    const result = await queryDatabase(sql, [params.userID]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "User not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation Error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Unexpected error during deletion:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
