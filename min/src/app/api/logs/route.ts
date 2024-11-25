import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { QueryOnlySchema } from "@/app/zods/query";
import { LogFields } from "@/app/utils/mapfields/log";
import { LogSchema } from "@/app/zods/db/log";
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      fields: searchParams.get("fields"),
    };

    console.log("Query Parameters:", queryParams);

    const filters = QueryOnlySchema.parse(queryParams);

    const selectedFields = filters.fields
      ? filters.fields.split(",").map((field) => field.trim())
      : LogFields;

    console.log("Selected Fields:", selectedFields);

    const invalidFields = selectedFields.filter(
      (field) => !LogFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return NextResponse.json(
        {
          message: "Invalid fields specified",
          invalidFields,
        },
        { status: 400 }
      );
    }

    const selectClause = selectedFields.join(", ");

    const conditions: string[] = [];
    const params: unknown[] = [];

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `SELECT ${selectClause} FROM API_Usage ${whereClause} ORDER BY CreatedAt DESC`;

    console.log("SQL Query:", sql);
    console.log("Query Params:", params);

    const apis = await queryDatabase<unknown>(sql, params);
    console.log("Database Results:", apis);

    if (!Array.isArray(apis)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }

    const validatedAPIs = selectedFields.includes("*")
      ? apis.map((api) => LogSchema["full"].parse(api))
      : apis.map((api) => {
          const schema = LogSchema["full"];
          return z
            .object(
              selectedFields.reduce((acc, field) => {
                if (field in schema.shape) {
                  acc[field as keyof typeof schema.shape] =
                    schema.shape[field as keyof typeof schema.shape];
                }
                return acc;
              }, {} as z.ZodRawShape)
            )
            .parse(api);
        });

    return NextResponse.json(validatedAPIs);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const parsedBody = LogSchema["post"].parse(body);

    const sql = `INSERT INTO API_Usage (User_ID, Endpoint, Method, Status, Response_Time) VALUES (?, ?, ?, ?, ?)`;
    const result = await queryDatabase(sql, [
      parsedBody.User_ID,
      parsedBody.Endpoint,
      parsedBody.Method,
      parsedBody.Status,
      parsedBody.Response_Time,
    ]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    return NextResponse.json({
      message: "Save Logs",
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
