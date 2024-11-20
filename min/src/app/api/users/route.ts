import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { registerUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Pass req and res to getServerSession for proper session retrieval
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = "SELECT * FROM User";
    if (db != null) {
      const [users] = await db.query(sql);
      return NextResponse.json(users);
    }
    // If db is null or an issue occurs, handle it here
    return NextResponse.json(
      { message: "Database connection failed" },
      { status: 500 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, email, password } = body;
  if (!username || !email || !password) {
    return NextResponse.json(
      { message: "Missing username, email, or password" },
      { status: 400 }
    );
  }

  try {
    const userId = await registerUser(username, email, password, null);
    return NextResponse.json(
      { message: "User created successfully", userId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding student:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
