import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { queryDatabase } from "@/app/utils/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ContactSchema } from "@/app/zods/db/contact";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "User") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `SELECT * FROM Contact ORDER BY CreatedAt DESC`;
    const reports = await queryDatabase(sql);
    if (!Array.isArray(reports)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }
    return NextResponse.json(reports);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "User") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const parsedBody = ContactSchema.post.parse(body);

    const sql = `INSERT INTO Contact (Admin_ID, Message, Status, CreatedAt) VALUES (?, ?, 'Open', NOW())`;
    const result = await queryDatabase(sql, [
      parsedBody.Admin_ID,
      parsedBody.Message,
    ]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    return NextResponse.json({
      message: "Report created successfully",
      reportID: result.insertId,
    });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { message: "Validation Error", errors: error.errors },
      { status: 400 }
    );
  }
  console.error("Error:", error);
  return NextResponse.json(
    { message: "Internal Server Error" },
    { status: 500 }
  );
}
