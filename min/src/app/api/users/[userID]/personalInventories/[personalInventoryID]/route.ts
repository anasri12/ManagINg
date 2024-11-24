import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { queryDatabase } from "@/app/utils/db";
import { PersonalInventoryItemFields } from "@/app/utils/mapfields/personalInventoryItem";
import { PersonalInventoryItemSchema } from "@/app/zods/db/personalInventoryItem";
import { QueryOnlySchema } from "@/app/zods/query";
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

    const groups = await queryDatabase<any[]>(sql, filter_params);
    console.log("Database Results:", groups);

    const validatedGroups = selectedFields.includes("*")
      ? groups.map((group) => PersonalInventoryItemSchema["full"].parse(group))
      : groups.map((group) => {
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
            .parse(group);
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
