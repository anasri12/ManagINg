"use client";

import { PersonalInventoryInterface } from "@/app/zods/db/personalInventory";
import Loading from "@/components/general/Loading";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface InventoryData {
  id: number;
  name: string;
  colabUsers: string;
  description: string;
  lastEditTime: string;
  lastEditBy: string;
}

export default function MyInventory() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [data, setData] = useState<InventoryData[]>([]); // Inventory data
  const [globalFilter, setGlobalFilter] = useState<string>("");
  useEffect(() => {
    const name = searchParams.get("name");
    const description = searchParams.get("description");
    const colabUsers = searchParams.get("colabUsers");

    // Add new inventory to the list if provided
    if (name && description && colabUsers) {
      setData((prevData) => [
        ...prevData,
        {
          id: prevData.length + 1,
          name,
          colabUsers,
          description,
          lastEditTime: new Date().toLocaleString(),
          lastEditBy: colabUsers,
        },
      ]);
    }
  }, [searchParams]);

  // Handle inventory deletion
  const handleDelete = (inventoryId: number) => {
    const confirmed = confirm(
      "Are you sure you want to delete this inventory?"
    );
    if (confirmed) {
      setData((prevData) => prevData.filter((item) => item.id !== inventoryId));
    }
  };

  // Filter data based on the global search filter
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="font-inria font-normal mb-4 text-5xl">My Inventory</div>
      <div className="rounded-md border shadow-sm bg-white">
        <div className="flex items-center py-4 px-6">
          {/* Search Box */}
          <Input
            placeholder="Search by name..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />

          <div className="ml-auto">
            <Link href="/newInventory" legacyBehavior>
              <Button className="bg-red-600 text-white hover:bg-red-700">
                + New Inventory
              </Button>
            </Link>
          </div>
        </div>

        {/* Inventory Table */}
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox aria-label="Select all" />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Colab Users</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Edit Time</TableHead>
              <TableHead>Last Edit By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item: InventoryData) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox aria-label={`Select row ${item.id}`} />
                  </TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.colabUsers}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.lastEditTime}</TableCell>
                  <TableCell>{item.lastEditBy}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 border-red-600"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No inventories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
