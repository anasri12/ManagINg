import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { GroupInventorySchema } from "@/app/zods/db/groupInventory";
import { OrganizationIDSchema } from "@/app/zods/params";
import { OrganizationMemberInterface } from "@/app/zods/db/organizationMember";

async function isMemberOfOrganization(organizationID: string, userID: string) {
  const sql = `
    SELECT COUNT(*) AS count 
    FROM OrganizationMembers 
    WHERE Organization_ID = ? AND User_ID = ?
  `;
  const result = await queryDatabase<OrganizationMemberInterface>(sql, [
    organizationID,
    userID,
  ]);

  if (!Array.isArray(result)) {
    throw new Error(
      "Unexpected query result: Expected an array, but got a ResultSetHeader."
    );
  }

  return result.length > 0;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { organizationID: string; groupInventoryID: string } }
) {
  try {
    const { organizationID, groupInventoryID } = OrganizationIDSchema.extend({
      groupInventoryID: z.string(),
    }).parse(params);

    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const userID = session.user.id;
    const isMember = await isMemberOfOrganization(organizationID, userID);
    if (!isMember)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const sql = `
      SELECT * 
      FROM GroupInventories 
      WHERE Organization_ID = ? AND ID = ?
    `;
    const groupInventory = await queryDatabase(sql, [
      organizationID,
      groupInventoryID,
    ]);

    if (!Array.isArray(groupInventory) || groupInventory.length === 0) {
      return NextResponse.json(
        { message: "Group inventory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(groupInventory[0]);
  } catch (error) {
    console.error("Error in GET groupInventory:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { organizationID: string; groupInventoryID: string } }
) {
  try {
    const { organizationID, groupInventoryID } = OrganizationIDSchema.extend({
      groupInventoryID: z.string(),
    }).parse(params);

    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const userID = session.user.id;
    const isMember = await isMemberOfOrganization(organizationID, userID);
    if (!isMember)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const body = await req.json();
    const parsedBody = GroupInventorySchema.patch.parse(body);

    const fields = Object.keys(parsedBody)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [
      ...Object.values(parsedBody),
      groupInventoryID,
      organizationID,
    ];

    const sql = `
      UPDATE GroupInventories 
      SET ${fields} 
      WHERE ID = ? AND Organization_ID = ?
    `;
    const result = await queryDatabase(sql, values);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Group inventory not found or no changes made" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Group inventory updated successfully",
    });
  } catch (error) {
    console.error("Error in PUT groupInventory:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { organizationID: string; groupInventoryID: string } }
) {
  try {
    const { organizationID, groupInventoryID } = OrganizationIDSchema.extend({
      groupInventoryID: z.string(),
    }).parse(params);

    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const userID = session.user.id;
    const isMember = await isMemberOfOrganization(organizationID, userID);
    if (!isMember)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const sql = `
      DELETE FROM GroupInventories 
      WHERE ID = ? AND Organization_ID = ?
    `;
    const result = await queryDatabase(sql, [groupInventoryID, organizationID]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Group inventory not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Group inventory deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE groupInventory:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
