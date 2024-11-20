"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export type inventoryName = {
  id: number;
  Name: string;
  Description: string;
  BoughtFrom: string;
  CurrentUsedDay: string;
  Brand: string;
  Price: Number;
  BoughtDate: string;
  EXPBFFDate: string;
  Picture: string;
  Amount: Number;
  GuaranteePeriod: string;
};

export const columns: ColumnDef<inventoryName>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "Name",
    header: "Name",
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "GuaranteePeriod",
    header: "Guarantee Period",
  },
];
