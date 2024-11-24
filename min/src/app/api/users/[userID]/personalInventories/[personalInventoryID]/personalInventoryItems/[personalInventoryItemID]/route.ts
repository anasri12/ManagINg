import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { PersonalInventoryItemSchema } from "@/app/zods/db/personalInventoryItem";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2/promise";
import { z } from "zod";

// PATCH method for updating an inventory item
export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      userID: string;
      personalInventoryID: number;
      personalInventoryItemID: number;
    };
  }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verify user session
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const parsedBody = PersonalInventoryItemSchema["patch"].parse(body);
    console.log(parsedBody);

    // Dynamically construct SQL query for updating fields
    const updates = Object.keys(parsedBody).map((field) => `${field} = ?`);
    const queryParams = [
      ...Object.values(parsedBody),
      params.personalInventoryID,
      params.personalInventoryItemID,
    ];

    const sql = `
      UPDATE Personal_Inventory_Item
      SET ${updates.join(", ")}, UpdatedAt = NOW()
      WHERE Personal_Inventory_ID = ? AND ID = ?
    `;
    console.log(sql);
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
        { message: "Inventory item updated successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to update inventory item" },
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

    console.error("Error updating inventory item:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE method for deleting an inventory item
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      userID: string;
      personalInventoryID: number;
      personalInventoryItemID: number;
    };
  }
) {
  try {
    const session = await getServerSession(authOptions);

    // Verify user session
    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `
      DELETE FROM Personal_Inventory_Item
      WHERE Personal_Inventory_ID = ? AND ID = ?
    `;
    const queryParams = [
      params.personalInventoryID,
      params.personalInventoryItemID,
    ];

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
        { message: "Inventory item deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to delete inventory item" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
