"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Loading from "@/components/general/Loading";
import { PersonalInventoryInterface } from "@/app/zods/db/personalInventory";

export default function Inventories() {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const [collaborations, setCollaborations] = useState<
    PersonalInventoryInterface["full"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userID) return;
        const response = await fetch(`/api/personalInventories`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setCollaborations(data);
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
  }, [session]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Pagination logic
  const totalPages = Math.ceil(collaborations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = collaborations.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="container mx-28 py-6 px-6">
      {/* Header */}
      <div className="font-inria text-5xl mb-8">Management</div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Link href="/admin/management/users">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Users
          </Button>
        </Link>
        <Link href="/admin/management/collaborations">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Collaborations
          </Button>
        </Link>
        <Link href="/admin/management/inventories">
          <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
            Inventories
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-md border shadow-sm bg-white">
        <div className="flex items-center py-4 px-6">
          <>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Owner_ID</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Updated By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((collaboration) => (
                  <TableRow key={collaboration.ID}>
                    <TableCell>{collaboration.ID}</TableCell>
                    <TableCell>{collaboration.Name}</TableCell>
                    <TableCell>{collaboration.Description}</TableCell>
                    <TableCell>{collaboration.Owner_ID}</TableCell>
                    <TableCell>
                      {collaboration.CreatedAt
                        ? format(collaboration.CreatedAt, "PPP p")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {collaboration.UpdatedAt
                        ? format(collaboration.UpdatedAt, "PPP p")
                        : "-"}
                    </TableCell>
                    <TableCell>{collaboration.UpdatedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>
                    Total Collaborations: {collaborations.length}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center py-4 px-6">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="bg-gray-200 text-black hover:bg-gray-300 px-4 py-2"
          >
            Previous
          </Button>
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-gray-200 text-black hover:bg-gray-300 px-4 py-2"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
