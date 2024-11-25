import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { queryDatabase } from "@/app/utils/db";
import { UserIDSchema } from "@/app/zods/params";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ReportSchema } from "@/app/zods/db/report";

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string; reportID: string } }
) {
  try {
    UserIDSchema.parse(params);

    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `SELECT * FROM Report WHERE ID = ? AND User_ID = ?`;
    const reports = await queryDatabase(sql, [params.reportID, params.userID]);

    if (!Array.isArray(reports)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }
    if (reports.length === 0) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ReportSchema["full"].parse(reports[0]));
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { userID: string; reportID: string } }
) {
  try {
    UserIDSchema.parse(params);

    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const parsedBody = ReportSchema.patch.parse(body);

    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(parsedBody)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(params.reportID, params.userID);

    const sql = `UPDATE Report SET ${fields.join(
      ", "
    )} WHERE ID = ? AND User_ID = ?`;
    await queryDatabase(sql, values);

    return NextResponse.json({ message: "Report updated successfully" });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userID: string; reportID: string } }
) {
  try {
    UserIDSchema.parse(params);

    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `DELETE FROM Report WHERE ID = ? AND User_ID = ?`;
    const result = await queryDatabase(sql, [params.reportID, params.userID]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Report not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Report deleted successfully" });
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
