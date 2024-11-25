import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { queryDatabase } from "@/app/utils/db";
import { UserIDSchema } from "@/app/zods/params";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReportSchema } from "@/app/zods/db/report";

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string } }
) {
  try {
    UserIDSchema.parse(params);
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `SELECT * FROM Report WHERE User_ID = ? ORDER BY CreatedAt DESC`;
    const reports = await queryDatabase(sql, [params.userID]);
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

export async function POST(
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
    const parsedBody = ReportSchema.post.parse(body);

    const sql = `INSERT INTO Report (User_ID, Message, Status, CreatedAt) VALUES (?, ?, 'Open', NOW())`;
    const result = await queryDatabase(sql, [
      parsedBody.User_ID,
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
