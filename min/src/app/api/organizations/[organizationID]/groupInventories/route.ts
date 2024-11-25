import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { GroupInventorySchema } from "@/app/zods/db/groupInventory";
import { OrganizationIDSchema } from "@/app/zods/params";
import { OrganizationMemberInterface } from "@/app/zods/db/organizationMember";
import { ResultSetHeader } from "mysql2";

async function isMemberOfOrganization(organizationID: string, userID: string) {
  const sql = `
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
  { params }: { params: { organizationID: string } }
) {
  try {
    const { organizationID } = OrganizationIDSchema.parse(params);

    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const userID = session.user.id;
    const isMember = await isMemberOfOrganization(organizationID, userID);
    if (!isMember)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    // Fetch group inventories
    const sql = `
      SELECT * 
      FROM GroupInventories 
      WHERE Organization_ID = ?
    `;
    const groupInventories = await queryDatabase(sql, [organizationID]);

    return NextResponse.json(groupInventories);
  } catch (error) {
    console.error("Error in GET groupInventories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { organizationID: string } }
) {
  try {
    const { organizationID } = OrganizationIDSchema.parse(params);

    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const userID = session.user.id;
    const isMember = await isMemberOfOrganization(organizationID, userID);
    if (!isMember)
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });

    const body = await req.json();
    const parsedBody = GroupInventorySchema.post.parse(body);

    const sql = `
      INSERT INTO GroupInventories (Organization_ID, Name, Description, CreatedBy) 
      VALUES (?, ?, ?, ?)
    `;
    const result = await queryDatabase<ResultSetHeader>(sql, [
      organizationID,
      parsedBody.Name,
      parsedBody.Description,
      userID,
    ]);
    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    return NextResponse.json({
      message: "Group inventory created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error in POST groupInventories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
