import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { PersonalInventoryFields } from "@/app/utils/mapfields/personalInventory";
import { PersonalInventorySchema } from "@/app/zods/db/personalInventory";
import { UserInterface } from "@/app/zods/db/user";
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
      : PersonalInventoryFields;

    // Automatically include usernames if not specified
    if (!selectedFields.includes("Owner_Username")) {
      selectedFields.push("Owner_Username");
    }
    if (!selectedFields.includes("Collaboration_ID")) {
      selectedFields.push("Collaboration_ID");
    }
    if (!selectedFields.includes("Collaborator_Username")) {
      selectedFields.push("Collaborator_Username");
    }
    if (!selectedFields.includes("Collaborator_Permission")) {
      selectedFields.push("Collaborator_Permission");
    }
    if (!selectedFields.includes("UpdatedBy_Username")) {
      selectedFields.push("UpdatedBy_Username");
    }

    console.log("Selected Fields:", selectedFields);

    const invalidFields = selectedFields.filter(
      (field) =>
        ![
          ...PersonalInventoryFields,
          "Owner_Username",
          "Collaboration_ID",
          "Collaborator_Username",
          "Collaborator_Permission",
          "UpdatedBy_Username",
        ].includes(field)
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

    // Include inventories owned by the user or where the user is a collaborator with status "Accepted"
    conditions.push(
      "(pi.Owner_ID = ? OR (c.Collaborator_ID = ? AND c.Status = 'Accepted'))"
    );
    filter_params.push(params.userID, params.userID);

    conditions.push("pi.ID = ?");
    filter_params.push(params.personalInventoryID);

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const selectClause = selectedFields
      .map((field) => {
        switch (field) {
          case "Owner_Username":
            return "owner.Username AS Owner_Username";
          case "Collaboration_ID":
            return `GROUP_CONCAT(c.ID) AS Collaboration_ID`; // For MySQL
          case "Collaborator_Username":
            return `GROUP_CONCAT(collaborator.Username) AS Collaborator_Username`; // For MySQL
          case "Collaborator_Permission":
            return `GROUP_CONCAT(c.Permission) AS Collaborator_Permission`; // For MySQL
          case "UpdatedBy_Username":
            return "updatedBy.Username AS UpdatedBy_Username";
          default:
            return `pi.${field}`;
        }
      })
      .join(", ");

    const sql = `
      SELECT ${selectClause}
      FROM Personal_Inventory pi
      LEFT JOIN Collaboration c ON pi.ID = c.Inventory_ID AND c.Status = 'Accepted'
      LEFT JOIN User owner ON pi.Owner_ID = owner.ID
      LEFT JOIN User collaborator ON c.Collaborator_ID = collaborator.ID
      LEFT JOIN User updatedBy ON pi.UpdatedBy = updatedBy.ID
      ${whereClause}
      GROUP BY pi.ID, owner.Username, updatedBy.Username
    `;

    console.log("SQL Query:", sql);
    console.log("Query Params:", filter_params);

    const personalInventories = await queryDatabase<any>(sql, filter_params);

    if (!Array.isArray(personalInventories)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }

    // Transform the Collaborator_Username field from a string to an array
    const transformedData = personalInventories.map((inventory) => ({
      ...inventory,
      Collaboration_ID: inventory.Collaboration_ID
        ? inventory.Collaboration_ID.split(",") // Split the string into an array
        : [],
      Collaborator_Username: inventory.Collaborator_Username
        ? inventory.Collaborator_Username.split(",") // Split the string into an array
        : [],
      Collaborator_Permission: inventory.Collaborator_Permission
        ? inventory.Collaborator_Permission.split(",") // Split the string into an array
        : [],
    }));

    console.log("Transformed Data:", transformedData);

    const validatedGroups = selectedFields.includes("*")
      ? transformedData.map((personalInventory) =>
          PersonalInventorySchema["full"].parse(personalInventory)
        )
      : transformedData.map((personalInventory) => {
          const schema = PersonalInventorySchema["full"];
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
            .parse(personalInventory);
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { userID: string; personalInventoryID: number } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();
    const parsedBody = PersonalInventorySchema["patch"].parse(body);

    if (!parsedBody || Object.keys(parsedBody).length === 0) {
      return NextResponse.json(
        { message: "No data provided for update" },
        { status: 400 }
      );
    }

    // Update the personal inventory fields
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(parsedBody)) {
      if (key === "Input_Enable" && typeof value === "object") {
        fields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else if (key !== "Collaborators") {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    values.push(params.personalInventoryID, params.userID);

    const sql = `
        UPDATE Personal_Inventory
        SET ${fields.join(", ")}, UpdatedAt = NOW()
        WHERE ID = ? AND Owner_ID = ?
      `;

    const result = await queryDatabase<ResultSetHeader>(sql, values);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No matching personal inventory found or update failed" },
        { status: 404 }
      );
    }

    // Function to validate collaborator IDs
    const validateCollaboratorUsername = async (
      collaboratorUsername: string
    ) => {
      const checkSql = `SELECT ID FROM User WHERE Username = ?`;
      const result = await queryDatabase<UserInterface["full"]>(checkSql, [
        collaboratorUsername,
      ]);
      if (Array.isArray(result) && result.length > 0) {
        const Collaborator_ID = result[0].ID;
        return Collaborator_ID;
      } else return false;
    };

    // Update collaborators if provided
    if (parsedBody.Collaborators) {
      const { update, delete: toDelete, add } = parsedBody.Collaborators;

      // Update collaborators
      if (update && update.length > 0) {
        for (const collaborator of update) {
          const updateSql = `
              UPDATE Collaboration
              SET Permission = ?
              WHERE ID = ?
            `;
          await queryDatabase(updateSql, [
            collaborator.permission,
            collaborator.collaborationID,
          ]);
        }
      }

      // Delete collaborators
      if (toDelete && toDelete.length > 0) {
        for (const collaborator of toDelete) {
          const deleteSql = `
              DELETE FROM Collaboration
              WHERE ID = ?
            `;
          await queryDatabase(deleteSql, [collaborator.collaborationID]);
        }
      }

      // Add new collaborators
      if (add && add.length > 0) {
        for (const collaborator of add) {
          const GetCollaboratorID = await validateCollaboratorUsername(
            collaborator.username
          );

          console.log(GetCollaboratorID);

          if (!GetCollaboratorID) {
            return NextResponse.json(
              {
                message: `Collaborator with ID '${collaborator.username}' does not exist.`,
              },
              { status: 400 }
            );
          }

          const insertSql = `
              INSERT INTO Collaboration (Collaborator_ID, Permission, Inventory_ID, Owner_ID)
              VALUES (?, ?, ?, ?)
            `;
          await queryDatabase(insertSql, [
            GetCollaboratorID,
            collaborator.permission,
            params.personalInventoryID,
            params.userID,
          ]);
        }
      }
    }

    return NextResponse.json({
      message: "Personal Inventory and Collaborators updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation Error", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating personal inventory:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { userID: string; personalInventoryID: number } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.id !== params.userID) {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const sql = `
        DELETE FROM Personal_Inventory
        WHERE ID = ? AND Owner_ID = ?
      `;

    const result = await queryDatabase<ResultSetHeader>(sql, [
      params.personalInventoryID,
      params.userID,
    ]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "No matching personal inventory found or deletion failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Personal Inventory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting personal inventory:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
