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
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonalInventoryItemInterface } from "@/app/zods/db/personalInventoryItem";
import { Session } from "next-auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { fetchWithLogging } from "@/app/utils/log";
interface BaseRowData {
  ID: number; // Include other common properties if needed
  Name: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string; // Add title prop
  apiUrl: string; // API URL for POST
  userID: string; // Current user ID
  inventoryID: number; // Inventory ID
}

export function DataTable<TData extends BaseRowData, TValue>({
  session,
  columns,
  data,
  formFields,
  title,
  apiUrl,
  inventoryID,
}: DataTableProps<TData, TValue> & {
  formFields: string[];
  session: Session | null;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [tableData, setTableData] = useState<TData[]>(data);
  const [newItem, setNewItem] = useState<Partial<TData>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({}); // Track validation errors for fields
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<Partial<TData>>({});

  const fieldConfig: Record<string, string> = {
    Name: "text",
    Description: "text",
    Brand: "text",
    Price: "number",
    Amount: "number",
    Bought_From: "text",
    Bought_Date: "date",
    EXP_BFF_Date: "date",
    Current_Used_Day: "number",
    Picture_URL: "text",
    Guarantee_Period: "text",
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

  const validateFields = () => {
    const errors: Record<string, boolean> = {};
    let hasError = false;

    formFields.forEach((field) => {
      if (
        !newItem[field as keyof TData] ||
        (newItem[field as keyof TData] as string).trim() === ""
      ) {
        errors[field] = true;
        hasError = true;
      } else {
        errors[field] = false;
      }
    });

    setValidationErrors(errors);
    return !hasError;
  };

  const handleAddItem = async () => {
    if (!validateFields()) return;

    const item = newItem as unknown as PersonalInventoryItemInterface["post"];

    const payload: PersonalInventoryItemInterface["post"] = {
      ...newItem,
      Personal_Inventory_ID: inventoryID,
      Amount: parseFloat(item.Amount as unknown as string) || 0,
      Price: parseFloat(item.Price as unknown as string) || 0,
      Bought_Date: item.Bought_Date
        ? format(new Date(item.Bought_Date), "yyyy-MM-dd") // Format date
        : null,
      EXP_BFF_Date: item.EXP_BFF_Date
        ? format(new Date(item.EXP_BFF_Date), "yyyy-MM-dd") // Format date
        : null,
      Current_Used_Day:
        parseInt(item.Current_Used_Day as unknown as string, 10) || 0,
      Avg_Used_Day_Per_Amount:
        parseInt(item.Avg_Used_Day_Per_Amount as unknown as string, 10) || 0,
      CreatedBy: session?.user.id!,
      UpdatedBy: session?.user.id!,
      Name: item.Name,
      Brand: item.Brand || null,
      Picture_URL: item.Picture_URL || null,
      Description: item.Description || null,
      Bought_From: item.Bought_From || null,
      Guarantee_Period: item.Guarantee_Period || null,
    };

    try {
      if (!session) return;
      const addPersonalInventoryItem = await fetchWithLogging(
        apiUrl,
        {
          method: "POST",
          body: payload,
        },
        session.user.id
      );

      console.log(addPersonalInventoryItem);
      window.location.reload();
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleEdit = (row: TData) => {
    setEditingRowId((row as any).ID);
    setEditedRow(row);
  };

  const handleSave = async () => {
    const item =
      editedRow as unknown as PersonalInventoryItemInterface["patch"];
    console.log(item);
    const payload: PersonalInventoryItemInterface["patch"] = {
      ...editedRow,
      Amount: parseFloat(item.Amount as unknown as string) || 0,
      Price: parseFloat(item.Price as unknown as string) || 0,
      Bought_Date: item.Bought_Date
        ? format(new Date(item.Bought_Date), "yyyy-MM-dd") // Format date
        : null,
      EXP_BFF_Date: item.EXP_BFF_Date
        ? format(new Date(item.EXP_BFF_Date), "yyyy-MM-dd") // Format date
        : null,
      Current_Used_Day:
        parseInt(item.Current_Used_Day as unknown as string, 10) || 0,
      UpdatedBy: session?.user.id!,
    };
    console.log(payload);

    try {
      if (!session) return;
      const patchUrl = `${apiUrl}/${editingRowId}`;
      const updateInventoryItem = await fetchWithLogging(
        patchUrl,
        {
          method: "PUT",
          body: payload,
        },
        session.user.id
      );

      console.log(updateInventoryItem);

      window.location.reload();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDelete = async (rowId: number) => {
    const confirmed = confirm("Are you sure you want to delete this item?");
    if (!confirmed) return;

    try {
      if (!session) return;
      const deleteUrl = `${apiUrl}/${rowId}`;
      const deletePersonalInventoryItem = await fetchWithLogging(
        deleteUrl,
        {
          method: "DELETE",
        },
        session.user.id
      );

      console.log(deletePersonalInventoryItem);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const parsedTableData =
    tableData as unknown as PersonalInventoryItemInterface["full"][];
  const filteredData = parsedTableData.filter((personalInventory) =>
    personalInventory.Name.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="container mx-auto  px-4">
      {title && (
        <div className="font-inria font-normal mt-8 mb-6 text-5xl pl-11 ">
          {title}
        </div>
      )}
      <div className="rounded-md border">
        <div className="flex items-center py-4 mx-10">
          <div className="flex flex-grow">
            <Input
              placeholder="Search by name..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
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
                      className={`w-full p-2 border rounded ${
                        validationErrors[field] ? "border-red-500" : ""
                      }`}
                    />
                    {validationErrors[field] && (
                      <p className="text-red-500 text-sm mt-1">
                        Please fill in the field. If there is no information,
                        enter "-".
                      </p>
                    )}
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
                <TableHead>Actions</TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table
                .getRowModel()
                .rows.filter((row) =>
                  globalFilter
                    ? (row.original as TData).Name?.toLowerCase().includes(
                        globalFilter.toLowerCase()
                      )
                    : true
                )
                .map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {editingRowId === (row.original as TData).ID ? (
                          fieldConfig[cell.column.id] === "date" ? (
                            <DatePicker
                              selected={
                                editedRow[cell.column.id as keyof TData]
                                  ? new Date(
                                      editedRow[
                                        cell.column.id as keyof TData
                                      ] as string
                                    )
                                  : null
                              }
                              onChange={(date: Date | null) => {
                                setEditedRow({
                                  ...editedRow,
                                  [cell.column.id]: date
                                    ? date.toISOString() // Maintain ISO format in state
                                    : null,
                                });
                              }}
                              className="w-full p-2 border rounded"
                              dateFormat="dd/MM/yyyy" // Format displayed date as day/month/year
                            />
                          ) : (
                            <input
                              type={fieldConfig[cell.column.id] || "text"}
                              value={
                                (editedRow[
                                  cell.column.id as keyof TData
                                ] as string) || ""
                              }
                              onChange={(e) =>
                                setEditedRow({
                                  ...editedRow,
                                  [cell.column.id]: e.target.value,
                                })
                              }
                              className="w-full p-2 border rounded"
                            />
                          )
                        ) : fieldConfig[cell.column.id] === "date" ? (
                          (row.original as TData)[
                            cell.column.id as keyof TData
                          ] ? (
                            format(
                              new Date(
                                (row.original as TData)[
                                  cell.column.id as keyof TData
                                ] as string
                              ),
                              "PPP"
                            )
                          ) : (
                            "N/A"
                          )
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {editingRowId === (row.original as any).ID ? (
                        <div className="flex gap-2">
                          <Button onClick={handleSave}>Save</Button>
                          <Button onClick={() => setEditingRowId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={() => handleEdit(row.original)}>
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              handleDelete((row.original as any).ID)
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </TableCell>
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
    </div>
  );
}
