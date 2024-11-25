"use client";

import { PersonalInventoryInterface } from "@/app/zods/db/personalInventory";
import Loading from "@/components/general/Loading";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function GroupInventory() {
  const { data: session } = useSession();
  const router = useRouter();
  const [groupInventories, setGroupInventories] = useState<
    PersonalInventoryInterface["full"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/users/${session?.user.id}/groupInventories`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setGroupInventories(data);
          setLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user.id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Handle inventory deletion
  const handleDelete = async (groupInventoryID: number) => {
    const confirmed = confirm(
      "Are you sure you want to delete this inventory?"
    );
    if (confirmed) {
      try {
        const response = await fetch(
          `/api/users/${session?.user.id}/groupInventories/${groupInventoryID}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete inventory");
        }

        window.location.reload();
      } catch (error) {
        console.error("Error deleting inventory:", error);
        alert("Failed to delete inventory. Please try again.");
      }
    }
  };

  // Filter data based on the global search filter
  const filteredData = groupInventories.filter((groupInventory) =>
    groupInventory.Name.toLowerCase().includes(globalFilter.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="font-inria font-normal mb-4 text-5xl">
        Group Inventory
      </div>
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
              <TableHead>NO.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Edit Time</TableHead>
              <TableHead>Last Edit By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((groupInventory, index) => (
                <TableRow
                  key={groupInventory.ID}
                  className={`cursor-pointer hover:bg-gray-100 ${
                    session?.user.id !== groupInventory.Owner_ID
                      ? "bg-red-100"
                      : ""
                  }`}
                  onClick={() => router.push(`/newGroup/${groupInventory.ID}`)}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{groupInventory.Name}</TableCell>
                  <TableCell>
                    {groupInventory.Collaborator_Username.length !== 0 ? (
                      <>
                        {groupInventory.Collaborator_Username.map(
                          (Member, index) => (
                            <div key={index}>{Member}</div>
                          )
                        )}
                      </>
                    ) : (
                      <div>-</div>
                    )}
                  </TableCell>
                  <TableCell>{groupInventory.Description}</TableCell>
                  <TableCell>
                    {groupInventory.UpdatedAt
                      ? format(new Date(groupInventory.UpdatedAt), "PPP p")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{groupInventory.UpdatedBy_Username}</TableCell>
                  <TableCell
                    onClick={(e) => e.stopPropagation()} // Prevent row click from triggering navigation
                  >
                    <div className="flex gap-2">
                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/myInventory/${groupInventory.ID}/edit`)
                        }
                        className="text-blue-600 border-blue-600"
                      >
                        Edit
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(groupInventory.ID)}
                        className="text-red-600 border-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
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
