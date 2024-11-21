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
  const [isAdding, setIsAdding] = useState(false); // Track whether the add box is visible
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({}); // Track validation errors for individual fields

  const fieldConfig: Record<string, string> = {
    id: "number",
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

  // const validateFields = () => {
  //   const errors: Record<string, boolean> = {};
  //   let hasError = false;

  //   // Validate all fields in the newItem object
  //   const requiredFields = [
  //     "Name",
  //     "Description",
  //     "Brand",
  //     "Price",
  //     "Amount",
  //     "BoughtFrom",
  //     "BoughtDate",
  //     "EXPBFFDate",
  //     "CurrentUsedDay",
  //     "Picture",
  //     "GuaranteePeriod",
  //   ];

  //   requiredFields.forEach((field) => {
  //     if (
  //       !newItem[field as keyof TData] ||
  //       (newItem[field as keyof TData] as string).trim() === ""
  //     ) {
  //       errors[field] = true;
  //       hasError = true;
  //     } else {
  //       errors[field] = false;
  //     }
  //   });

  //   setValidationErrors(errors);
  //   return !hasError; // Return true if there are no errors
  // };

  const handleAddItem = () => {
    // if (!validateFields()) {
    //   return; // Exit if validation fails
    // }

    // Add the new item
    setTableData((prev) => [
      ...prev,
      { ...newItem, id: prev.length + 1 } as TData, // Ensure compatibility
    ]);
    console.log(tableData);
    setNewItem({}); // Clear form inputs
    setValidationErrors({}); // Clear validation errors
    setIsAdding(false); // Hide the add box
  };

  return (
    <div className="rounded-md border">
      <div className="flex items-center py-4 mx-10">
        {/* Search Box */}
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

        {/* Select Column Button */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Select columns</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
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
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add Item Button */}
        <div className="ml-4">
          <button
            type="button"
            className="w-auto py-2 px-4 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
            onClick={() => setIsAdding(!isAdding)} // Toggle add box visibility
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
                    type={fieldConfig[field] || "text"} // Dynamic input type
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

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        {/* Data Rows */}
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
