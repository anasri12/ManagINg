import { db } from "@/lib/db";

import { ResultSetHeader } from "mysql2/promise";
import { LogInterface } from "../zods/db/log";

export async function queryDatabase<T>(
  sql: string,
  params: any[] | null = null
): Promise<T[] | ResultSetHeader> {
  try {
    const [rows] =
      params === undefined ? await db.query(sql) : await db.query(sql, params);

    // Check if rows is an array or ResultSetHeader and handle accordingly
    if (Array.isArray(rows)) {
      return rows as T[]; // For SELECT queries
    }

    if (rows && typeof rows === "object" && "affectedRows" in rows) {
      return rows as ResultSetHeader; // For INSERT, UPDATE, DELETE
    }

    console.error("Unexpected query result:", rows);
    throw new Error("Query returned an unexpected result type");
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Database error");
  }
}

