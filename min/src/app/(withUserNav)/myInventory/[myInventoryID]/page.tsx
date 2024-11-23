"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import { inventoryName } from "./columns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { TableCheckbox } from "@/components/ui/tablecheckbox";

export default function AddInventory() {
  const searchParams = useSearchParams();
  const [dynamicColumns, setDynamicColumns] = useState<
    ColumnDef<inventoryName>[]
  >([]);
  const [data, setData] = useState<inventoryName[]>([]);
  const [formFields, setFormFields] = useState<string[]>([]); // Holds selected column names

  useEffect(() => {
    const columns = JSON.parse(searchParams.get("columns") || "[]");

    // Update formFields with selected column names
    setFormFields(columns);

    // Define all available columns with `id`
    const allColumns: ColumnDef<inventoryName>[] = [
      {
        id: "select", // Custom column for row selection
        header: ({ table }) => (
          <TableCheckbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <TableCheckbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "id",
        header: "NO.",
        cell: ({ row }) => row.original.id,
      },
      {
        id: "Name",
        header: "Name",
        cell: ({ row }) => row.original.Name,
      },
      {
        id: "Description",
        header: "Description",
        cell: ({ row }) => row.original.Description,
      },
      {
        id: "BoughtFrom",
        header: "Bought From",
        cell: ({ row }) => row.original.BoughtFrom,
      },
      {
        id: "CurrentUsedDay",
        header: "Current Used Day",
        cell: ({ row }) => row.original.CurrentUsedDay,
      },
      {
        id: "Brand",
        header: "Brand",
        cell: ({ row }) => row.original.Brand,
      },
      {
        id: "Price",
        header: "Price",
        cell: ({ row }) => row.original.Price,
      },
      {
        id: "BoughtDate",
        header: "Bought Date",
        cell: ({ row }) => row.original.BoughtDate,
      },
      {
        id: "EXPBFFDate",
        header: "EXP / BFF Date",
        cell: ({ row }) => row.original.EXPBFFDate,
      },
      {
        id: "Picture",
        header: "Picture",
        cell: ({ row }) => row.original.Picture,
      },
      {
        id: "Amount",
        header: "Amount",
        cell: ({ row }) => row.original.Amount,
      },
      {
        id: "GuaranteePeriod",
        header: "Guarantee Period",
        cell: ({ row }) => row.original.GuaranteePeriod,
      },
    ];

    // Combine required and selected columns
    const requiredColumns = allColumns.filter(
      (col) => col.id === "select" || col.id === "id"
    );

    const additionalColumns = allColumns.filter((col) =>
      columns.includes(col.id!)
    );

    // Update dynamic columns state
    setDynamicColumns([...requiredColumns, ...additionalColumns]);
  }, [searchParams]);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={dynamicColumns} data={data} formFields={formFields} />
    </div>
  );
}
