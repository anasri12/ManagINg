import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

interface User {
  ID: string;
  Username: string;
  Email: string;
  Password_Hash: string;
  Profile_Picture_URL: string;
  CreatedAt: string;
  UpdatedAt: string;
  Role: string;
}
export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    console.log("Params:", params);
    const [result] = await db.query("SELECT * FROM User WHERE ID = ?", [
      params.userID,
    ]);

    if ((result as User[]).length === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json((result as User[])[0]);
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated and owns the resource
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    console.log(body);

    // Validate that the body contains data
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { message: "No data provided for update" },
        { status: 400 }
      );
    }

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(body)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    // Add the userID to the values for the WHERE clause
    values.push(params.userID);

    const sql = `
      UPDATE User
      SET ${fields.join(", ")}
      WHERE ID = ?
    `;

    await db.query(sql, values);

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
