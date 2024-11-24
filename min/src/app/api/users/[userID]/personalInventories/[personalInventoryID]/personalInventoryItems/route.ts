import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { PersonalInventoryItemFields } from "@/app/utils/mapfields/personalInventoryItem";
import { PersonalInventoryItemSchema } from "@/app/zods/db/personalInventoryItem";
import { QueryOnlySchema } from "@/app/zods/query";
import { ResultSetHeader } from "mysql2/promise";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string; personalInventoryID: number } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
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
      : PersonalInventoryItemFields;

    console.log("Selected Fields:", selectedFields);

    const invalidFields = selectedFields.filter(
      (field) => !PersonalInventoryItemFields.includes(field)
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

    const conditions: string[] = [];
    const filter_params: any[] = [];

    conditions.push("Personal_Inventory_ID = ?");
    filter_params.push(params.personalInventoryID);

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const selectClause = selectedFields.join(", ");

    const sql = `
        SELECT ${selectClause}
        FROM Personal_Inventory_Item
        ${whereClause}`;

    console.log("SQL Query:", sql);
    console.log("Query Params:", filter_params);

    const personalInventoryItems = await queryDatabase<any[]>(
      sql,
      filter_params
    );
    console.log("Database Results:", personalInventoryItems);

    if (!Array.isArray(personalInventoryItems)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }

    const validatedGroups = selectedFields.includes("*")
      ? personalInventoryItems.map((personalInventoryItem) =>
          PersonalInventoryItemSchema["full"].parse(personalInventoryItem)
        )
      : personalInventoryItems.map((personalInventoryItem) => {
          const schema = PersonalInventoryItemSchema["full"];
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
            .parse(personalInventoryItem);
        });

    return NextResponse.json(validatedGroups);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { userID: string; personalInventoryID: number } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verify user session
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const parsedBody = PersonalInventoryItemSchema["post"].parse(body);
    console.log(parsedBody);

    // Construct SQL query and params
    const sql = `
      INSERT INTO Personal_Inventory_Item (
        Personal_Inventory_ID,
        Name,
        Description,
        Bought_From,
        Current_Used_Day,
        Brand,
        Price,
        Bought_Date,
        EXP_BFF_Date,
        Picture_URL,
        Amount,
        Guarantee_Period,
        CreatedBy,
        UpdatedBy
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    console.log(sql);

    const queryParams = [
      params.personalInventoryID,
      parsedBody.Name,
      parsedBody.Description,
      parsedBody.Bought_From,
      parsedBody.Current_Used_Day,
      parsedBody.Brand,
      parsedBody.Price,
      parsedBody.Bought_Date,
      parsedBody.EXP_BFF_Date,
      parsedBody.Picture_URL,
      parsedBody.Amount,
      parsedBody.Guarantee_Period,
      parsedBody.CreatedBy,
      parsedBody.UpdatedBy,
    ];
    console.log(queryParams);

    // Execute the query
    const result = await queryDatabase<ResultSetHeader>(sql, queryParams);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    // Check result
    if (result.affectedRows === 1) {
      return NextResponse.json(
        {
          message: "Inventory item created successfully",
          itemID: result.insertId, // Newly created inventory item ID
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to create inventory item" },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
