"use client";

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
import { GroupInventoryInterface } from "@/app/zods/db/groupInventory";
import { MemberIDOrganization } from "@/app/api/organizations/utils";

export default function GroupInventory({
  params,
}: {
  params: { groupID: string };
}) {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const router = useRouter();
  const [groupInventories, setGroupInventories] = useState<
    GroupInventoryInterface["full"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userID) return;
        const groupInventoryData = await fetchWithLogging<
          GroupInventoryInterface["full"][]
        >(
          `/api/organizations/${params.groupID}/groupInventories`,
          { method: "GET" },
          session.user.id
        );
        setGroupInventories(groupInventoryData);
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

  const filteredData = groupInventories.filter((groupInventory) =>
    groupInventory.Name.toLowerCase().includes(globalFilter.toLowerCase())
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
              filteredData.map(async (groupInventory) => (
                <TableRow
                  key={groupInventory.ID}
                  className={`cursor-pointer hover:bg-gray-100`}
                  onClick={() =>
                    router.push(
                      `group/${params.groupID}/groupInventory/${groupInventory.ID}`
                    )
                  }
                >
                  <TableCell>{groupInventory.ID}</TableCell>
                  <TableCell>{groupInventory.Name}</TableCell>
                  <TableCell></TableCell>
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
