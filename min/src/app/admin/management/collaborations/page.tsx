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
import { UserInterface } from "@/app/zods/db/user";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CollaborationInterface } from "@/app/zods/db/collaboration";
import { format } from "date-fns";
import Loading from "@/components/general/Loading";

export default function Collaborations() {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const [collaborations, setCollaborations] = useState<
    CollaborationInterface["full"][]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userID) return;
        const response = await fetch(`/api/collaborations`);
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
          <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
            Collaborations
          </Button>
        </Link>
        <Link href="/admin/management/inventories">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Inventories
          </Button>
        </Link>
      </div>

      {/* table */}
      <div className="rounded-md border shadow-sm bg-white">
        <div className="flex items-center py-4 px-6">
          <>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Inventory Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Resolved At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborations.map((collaboration) => (
                  <TableRow key={collaboration.ID}>
                    <TableCell>{collaboration.ID}</TableCell>
                    <TableCell>{collaboration.Collaborator_Username}</TableCell>
                    <TableCell>{collaboration.Inventory_Name}</TableCell>
                    <TableCell>{collaboration.Status}</TableCell>
                    <TableCell>
                      {collaboration.CreatedAt
                        ? format(collaboration.CreatedAt, "PPP p")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {collaboration.ResolvedAt
                        ? format(collaboration.ResolvedAt, "PPP p")
                        : "-"}
                    </TableCell>
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
      </div>
    </div>
  );
}
