"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import { inventoryName } from "./columns";

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

    const allColumns: ColumnDef<inventoryName>[] = [
      { accessorKey: "Name", header: "Name" },
      { accessorKey: "Description", header: "Description" },
      { accessorKey: "BoughtFrom", header: "Bought From" },
      { accessorKey: "CurrentUsedDay", header: "Current Used Day" },
      { accessorKey: "Brand", header: "Brand" },
      { accessorKey: "Price", header: "Price" },
      { accessorKey: "BoughtDate", header: "Bought Date" },
      { accessorKey: "EXPBFFDate", header: "EXP / BFF Date" },
      { accessorKey: "Picture", header: "Picture" },
      { accessorKey: "Amount", header: "Amount" },
      { accessorKey: "GuaranteePeriod", header: "Guarantee Period" },
    ];

    // Filter the selected columns safely
    const selectedColumns = allColumns.filter(
      (col) => "accessorKey" in col && columns.includes(col.accessorKey)
    );

    setDynamicColumns(selectedColumns);
  }, [searchParams]);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={dynamicColumns} data={data} formFields={formFields} />
    </div>
  );
}
