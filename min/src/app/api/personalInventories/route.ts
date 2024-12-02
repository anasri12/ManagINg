import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { AdminPersonalInventoryFields } from "@/app/utils/mapfields/personalInventory";
import { PersonalInventorySchema } from "@/app/zods/db/personalInventory";
import { QueryOnlySchema } from "@/app/zods/query";
import { ResultSetHeader } from "mysql2/promise";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `
      SELECT *
      FROM Personal_Inventory 
    `;

    console.log("SQL Query:", sql);

    const personalInventories = await queryDatabase<any>(sql);

    if (!Array.isArray(personalInventories)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }
    return NextResponse.json(personalInventories);
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
  { params }: { params: { userID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verify user session
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const parsedBody = PersonalInventorySchema["post"].parse(body);

    // Construct SQL query and params
    const sql = `
      INSERT INTO Personal_Inventory (Name, Description, Owner_ID, Input_Enable, CreatedAt, UpdatedAt, UpdatedBy)
      VALUES (?, ?, ?, ?, NOW(), NOW(), ?)
    `;

    const queryParams = [
      parsedBody.Name,
      parsedBody.Description,
      parsedBody.Owner_ID,
      JSON.stringify(parsedBody.Input_Enable), // Store Input_Enable as a JSON string
      parsedBody.UpdatedBy,
    ];

    // Execute the query
    const result = await queryDatabase<ResultSetHeader>(sql, queryParams);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected an ResultSetHeader, but got an array."
      );
    }

    // Check result
    if (result.affectedRows === 1) {
      return NextResponse.json(
        {
          message: "Inventory created successfully",
          inventoryID: result.insertId, // Newly created inventory ID
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to create inventory" },
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

    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
