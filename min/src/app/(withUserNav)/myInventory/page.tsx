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
import { fetchWithLogging } from "@/app/utils/log";

export default function MyInventory() {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const router = useRouter();
  const [personalInventories, setPersonalInventories] = useState<
    PersonalInventoryInterface["full"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userID) return;
        const personalInventoryData = await fetchWithLogging<
          PersonalInventoryInterface["full"][]
        >(
          `/api/users/${userID}/personalInventories`,
          { method: "GET" },
          session.user.id
        );
        setPersonalInventories(personalInventoryData);
        setLoading(false);
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
  }, [userID]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleDelete = async (personalInventoryID: number) => {
    if (!userID) return;
    const confirmed = confirm(
      "Are you sure you want to delete this inventory?"
    );
    if (confirmed) {
      try {
        const deletePersonalInventory = await fetchWithLogging(
          `/api/users/${userID}/personalInventories/${personalInventoryID}`,
          {
            method: "DELETE",
          },
          userID
        );
        console.log(deletePersonalInventory);

        window.location.reload();
      } catch (error) {
        console.error("Error deleting inventory:", error);
        alert("Failed to delete inventory. Please try again.");
      }
    }
  };

  const filteredData = personalInventories.filter((personalInventory) =>
    personalInventory.Name.toLowerCase().includes(globalFilter.toLowerCase())
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
              filteredData.map((personalInventory) => (
                <TableRow
                  key={personalInventory.ID}
                  className={`cursor-pointer hover:bg-gray-100 ${
                    session?.user.id !== personalInventory.Owner_ID
                      ? "bg-red-100"
                      : ""
                  }`}
                  onClick={() =>
                    router.push(`/myInventory/${personalInventory.ID}`)
                  }
                >
                  <TableCell>{personalInventory.ID}</TableCell>
                  <TableCell>{personalInventory.Name}</TableCell>
                  <TableCell>
                    {personalInventory.Collaborator_Username.length !== 0 ? (
                      <>
                        {personalInventory.Collaborator_Username.map(
                          (collaborator, index) => (
                            <div key={index}>{collaborator}</div>
                          )
                        )}
                      </>
                    ) : (
                      <div>-</div>
                    )}
                  </TableCell>
                  <TableCell>{personalInventory.Description}</TableCell>
                  <TableCell>
                    {personalInventory.UpdatedAt
                      ? format(new Date(personalInventory.UpdatedAt), "PPP p")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{personalInventory.UpdatedBy_Username}</TableCell>
                  <TableCell
                    onClick={(e) => e.stopPropagation()} // Prevent row click from triggering navigation
                  >
                    <div className="flex gap-2">
                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/myInventory/${personalInventory.ID}/edit`
                          )
                        }
                        className="text-blue-600 border-blue-600"
                      >
                        Edit
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(personalInventory.ID)}
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
