import { queryDatabase } from "@/app/utils/db";
import { OrganizationInterface } from "@/app/zods/db/organization";
import { OrganizationMemberInterface } from "@/app/zods/db/organizationMember";

export async function isMemberOfOrganization(
  organizationID: string,
  userID: string
) {
  const sql = `
      SELECT ID FROM Organization_Member 
      WHERE Organization_Code = ? AND User_ID = ?
    `;
  const result = await queryDatabase<OrganizationMemberInterface["full"]>(sql, [
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

export async function RoleOfOrganization(
  organizationID: string,
  userID: string
) {
  const sql = `
        SELECT Role FROM Organization_Member
        WHERE Organization_Code = ? AND User_ID = ?
      `;
  const result = await queryDatabase<OrganizationMemberInterface["full"]>(sql, [
    organizationID,
    userID,
  ]);

  if (!Array.isArray(result)) {
    throw new Error(
      "Unexpected query result: Expected an array, but got a ResultSetHeader."
    );
  }

  const Role = result[0].Role;

  return Role;
}

export async function MemberIDOrganization(
  organizationID: string,
  userID: string
) {
  const sql = `
        SELECT ID FROM Organization_Member
        WHERE Organization_Code = ? AND User_ID = ?
      `;
  const result = await queryDatabase<OrganizationMemberInterface["full"]>(sql, [
    organizationID,
    userID,
  ]);

  if (!Array.isArray(result)) {
    throw new Error(
      "Unexpected query result: Expected an array, but got a ResultSetHeader."
    );
  }

  const ID = result[0].ID;

  return ID;
}

export async function GetOrganizationName(organizationID: string) {
  const sql = `
        SELECT Name FROM Organization
        WHERE Organization_Code = ?
      `;
  const result = await queryDatabase<OrganizationInterface["full"]>(sql, [
    organizationID,
  ]);

  if (!Array.isArray(result)) {
    throw new Error(
      "Unexpected query result: Expected an array, but got a ResultSetHeader."
    );
  }

  const Name = result[0].Name;

  return Name;
}
