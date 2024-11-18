import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

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
