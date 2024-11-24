"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export type InventoryItemColumnTable = {
  ID: number;
  Name: string;
  Description: string;
  Bought_From: string;
  Current_Used_Day: string;
  Brand: string;
  Price: number;
  Bought_Date: string;
  EXP_BFF_Date: string;
  Picture_URL: string;
  Amount: number;
  Guarantee_Period: string;
};

export const columns: ColumnDef<InventoryItemColumnTable>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "Name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "Description",
    header: "Description",
  },
  {
    accessorKey: "BoughtFrom",
    header: "Bought From",
  },
  {
    accessorKey: "CurrentUsedDay",
    header: "Current Used Day",
  },
  {
    accessorKey: "Brand",
    header: "Brand",
  },
  {
    accessorKey: "Price",
    header: "Price",
  },
  {
    accessorKey: "BoughtDate",
    header: "Bought Date",
  },
  {
    accessorKey: "EXPBFFDate",
    header: "EXP / BFF Date",
  },
  {
    accessorKey: "Picture",
    header: "Picture",
  },
  {
    accessorKey: "Amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "GuaranteePeriod",
    header: "Guarantee Period",
  },
];
