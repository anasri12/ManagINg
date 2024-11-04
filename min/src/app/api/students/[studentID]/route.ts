import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "../../../../lib/db.js";

export async function GET(
  req: NextRequest,
  { params }: { params: { studentID: string } }
) {
  try {
    console.log("Params:", params);
    const db = await createConnection();
    const sql = `SELECT * FROM student WHERE student_ID = ?`;
    const [student] = await db.query(sql, [params.studentID]);

    if (student.length === 0) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Database connection failed:", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
