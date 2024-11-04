import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "../../../lib/db.js";

export async function GET() {
  try {
    const db = await createConnection();
    const sql = "SELECT * FROM student";
    if (db != null) {
      const [students] = await db.query(sql);
      return NextResponse.json(students);
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);
    const { student_ID, first_name, last_name, dept_code } = body;

    if (!student_ID || !first_name || !last_name || !dept_code) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }
    NextResponse.json({ message: "Invalid data" }, { status: 400 });
    const db = await createConnection();

    const sql = `INSERT INTO student (student_ID, first_name, last_name, dept_code) VALUES (?, ?, ?, ?)`;
    if (db != null) {
      await db.query(sql, [student_ID, first_name, last_name, dept_code]);
      return NextResponse.json(
        { message: "Student added successfully" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error adding student:", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
