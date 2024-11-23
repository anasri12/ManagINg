"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  formFields,
}: DataTableProps<TData, TValue> & { formFields: string[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [tableData, setTableData] = useState<TData[]>(data);
  const [newItem, setNewItem] = useState<Partial<TData>>({});
  const [isAdding, setIsAdding] = useState(false);

  const fieldConfig: Record<string, string> = {
    Name: "text",
    Description: "text",
    Brand: "text",
    Price: "number",
    Amount: "number",
    BoughtFrom: "text",
    BoughtDate: "date",
    EXPBFFDate: "date",
    CurrentUsedDay: "date",
    Picture: "text",
    GuaranteePeriod: "text",
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleAddItem = () => {
    setTableData((prev) => [
      ...prev,
      { ...newItem, id: prev.length + 1 } as TData,
    ]);
    console.log(tableData);
    setNewItem({});
    setIsAdding(false);
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center py-4 mx-10">
        <div className="flex flex-grow">
          <Input
            placeholder="Search by name..."
            value={(table.getColumn("Name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("Name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Select columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-4">
          <button
            type="button"
            className="w-auto py-2 px-4 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? "Cancel" : "Add Item"}
          </button>
        </div>
      </div>

      <div>
        {isAdding && (
          <div className="rounded-md border p-4">
            <h3 className="text-lg font-semibold">Add New Item</h3>
            <div className="grid grid-cols-4 gap-4 mt-4">
              {formFields.map((field) => (
                <div key={field} className="flex flex-col">
                  <label>{field}</label>
                  <input
                    type={fieldConfig[field] || "text"}
                    value={(newItem[field as keyof TData] as string) || ""}
                    onChange={(e) =>
                      setNewItem({ ...newItem, [field]: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 mr-[23px] flex justify-end">
              <button
                onClick={handleAddItem}
                className="w-auto py-2 px-6 text-sm text-white bg-black rounded-md hover:bg-gray-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
