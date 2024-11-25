import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { queryDatabase } from "@/app/utils/db";
import { QueryCollaborationSchema } from "@/app/zods/query";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CollaborationFields } from "@/app/utils/mapfields/collaboration";
import { CollaborationSchema } from "@/app/zods/db/collaboration";
import { ResultSetHeader } from "mysql2/promise";
import { useSearchParams } from "next/navigation";

export async function GET(
  req: NextRequest,
  { params }: { params: { userID: string; collaborationID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `
        SELECT c.*, i.Name AS Inventory_Name, owner.Username AS Owner_Username, collaborator.Username AS Collaborator_Username
        FROM Collaboration c
        LEFT JOIN Personal_Inventory i ON c.Inventory_ID = i.ID
        LEFT JOIN User owner ON c.Owner_ID = owner.ID
        LEFT JOIN User collaborator ON c.Collaborator_ID = collaborator.ID
        WHERE c.ID = ? AND (c.Owner_ID = ? OR c.Collaborator_ID = ?)
      `;

    const result = await queryDatabase(sql, [
      params.collaborationID,
      params.userID,
      params.userID,
    ]);

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json(
        { message: "Collaboration not found" },
        { status: 404 }
      );
    }

    const collaboration = CollaborationSchema["full"].parse(result[0]);

    return NextResponse.json(collaboration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching collaboration:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userID: string; collaborationID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const parsedBody = CollaborationSchema["patch"].parse(body);

    if (!parsedBody || Object.keys(parsedBody).length === 0) {
      return NextResponse.json(
        { message: "No data provided for update" },
        { status: 400 }
      );
    }

    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(parsedBody)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    values.push(params.collaborationID, params.userID);

    const sql = `
        UPDATE Collaboration
        SET ${fields.join(", ")}, ResolvedAt = NOW()
        WHERE ID = ? AND Collaborator_ID = ?
      `;

    const result = await queryDatabase<ResultSetHeader>(sql, values);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Collaboration not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Collaboration updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating collaboration:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userID: string; collaborationID: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `
        DELETE FROM Collaboration
        WHERE ID = ? AND (Owner_ID = ? OR Collaborator_ID = ?)
      `;

    const result = await queryDatabase<ResultSetHeader>(sql, [
      params.collaborationID,
      params.userID,
      params.userID,
    ]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Collaboration not found or deletion failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Collaboration deleted successfully" });
  } catch (error) {
    console.error("Error deleting collaboration:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
