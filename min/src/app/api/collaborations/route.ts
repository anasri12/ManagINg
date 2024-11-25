import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { queryDatabase } from "@/app/utils/db";
import { QueryCollaborationSchema } from "@/app/zods/query";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { CollaborationFields } from "@/app/utils/mapfields/collaboration";
import { CollaborationSchema } from "@/app/zods/db/collaboration";
import { ResultSetHeader } from "mysql2/promise";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      status: searchParams.get("status"),
      fields: searchParams.get("fields"),
    };

    console.log("Query Parameters:", queryParams);

    const filters = QueryCollaborationSchema.parse(queryParams);

    const selectedFields = filters.fields
      ? filters.fields.split(",").map((field) => field.trim())
      : CollaborationFields;

    console.log("Selected Fields:", selectedFields);

    const invalidFields = selectedFields.filter(
      (field) => !CollaborationFields.includes(field)
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

    if (!selectedFields.includes("Inventory_Name")) {
      selectedFields.push("Inventory_Name");
    }
    if (!selectedFields.includes("Owner_Username")) {
      selectedFields.push("Owner_Username");
    }
    if (!selectedFields.includes("Collaborator_Username")) {
      selectedFields.push("Collaborator_Username");
    }

    const selectClause = selectedFields
      .map((field) => {
        switch (field) {
          case "Inventory_Name":
            return "i.Name AS Inventory_Name";
          case "Owner_Username":
            return "owner.Username AS Owner_Username";
          case "Collaborator_Username":
            return "collaborator.Username AS Collaborator_Username";
          default:
            return `c.${field}`;
        }
      })
      .join(", ");

    const conditions: string[] = [];
    const filter_params: unknown[] = [];

    if (filters.status) {
      conditions.push("c.Status = ?");
      filter_params.push(filters.status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sql = `
        SELECT ${selectClause}
        FROM Collaboration c
        LEFT JOIN Personal_Inventory i ON c.Inventory_ID = i.ID
        LEFT JOIN User owner ON c.Owner_ID = owner.ID
        LEFT JOIN User collaborator ON c.Collaborator_ID = collaborator.ID
        ${whereClause} ORDER BY c.ID ASC
      `;

    console.log("SQL Query:", sql);
    console.log("Query Params:", filter_params);

    const collaborations = await queryDatabase<unknown>(sql, filter_params);

    if (!Array.isArray(collaborations)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }

    const validatedUsers = selectedFields.includes("*")
      ? collaborations.map((collaboration) =>
          CollaborationSchema["full"].parse(collaboration)
        )
      : collaborations.map((collaboration) => {
          const schema = CollaborationSchema["full"];
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
            .parse(collaboration);
        });

    return NextResponse.json(validatedUsers);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error fetching collaborations:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log(
      "--------------------------------------------------------------------"
    );
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "Admin") {
      return NextResponse.json({ message: "Access Denied" }, { status: 403 });
    }

    const body = await req.json();

    // Parse and validate the body
    const parsedBody = CollaborationSchema["post"].parse(body);

    // Fetch the Collaborator ID using their username
    const fetchCollaboratorSQL = `SELECT ID FROM User WHERE Username = ?`;
    const collaboratorResult = await queryDatabase<{ ID: string }>(
      fetchCollaboratorSQL,
      [parsedBody.Collaborator_Username] // Assume the body contains `Collaborator_Username`
    );

    if (!Array.isArray(collaboratorResult)) {
      throw new Error(
        "Unexpected query result: Expected an array, but got a ResultSetHeader."
      );
    }

    if (!collaboratorResult || collaboratorResult.length === 0) {
      return NextResponse.json(
        { message: "Collaborator not found." },
        { status: 404 }
      );
    }

    const collaboratorID = collaboratorResult[0].ID;

    // Proceed with inserting the collaboration record
    const sql = `
          INSERT INTO Collaboration 
          (Permission, Inventory_ID, Owner_ID, Collaborator_ID) 
          VALUES (?, ?, ?, ?)
        `;

    const result = await queryDatabase<ResultSetHeader>(sql, [
      parsedBody.Permission,
      parsedBody.Inventory_ID,
      session.user.id,
      collaboratorID, // Use the fetched collaborator ID
    ]);

    if (Array.isArray(result)) {
      throw new Error(
        "Unexpected query result: Expected a ResultSetHeader, but got an array."
      );
    }

    if (!result || result.affectedRows === 0) {
      throw new Error("Failed to insert collaboration.");
    }

    const insertedID = result.insertId;

    return NextResponse.json({
      message: "Collaboration created successfully",
      collaborationID: insertedID,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return NextResponse.json(
        { message: "Validation failed", errors: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating collaboration:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
