import { db } from "@/lib/db";

export async function queryDatabase<T>(
  sql: string,
  params: any[] | null = null
): Promise<T[]> {
  try {
    const [rows] =
      params === undefined ? await db.query(sql) : await db.query(sql, params);

    if (!Array.isArray(rows)) {
      console.error("Unexpected query result:", rows);
      throw new Error("Query did not return an array");
    }

    return rows as T[];
  } catch (error) {
    console.error("Database query failed:", error);
    throw new Error("Database error");
  }
}
