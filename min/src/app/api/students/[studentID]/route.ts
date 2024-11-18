import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface Student {
  ID: string;
  Name: string;
}
export async function GET(
  req: NextRequest,
  { params }: { params: { studentID: string } }
) {
  try {
    console.log("Params:", params);
    const [result] = await db.query(
      "SELECT * FROM student WHERE student_ID = ?",
      [params.studentID]
    );

    // Handle the case where result.rows is empty
    if ((result as Student[]).length === 0) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Return the first student from the result.rows
    return NextResponse.json((result as Student[])[0]);
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
