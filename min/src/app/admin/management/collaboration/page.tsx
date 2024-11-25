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

export default function Users() {
  const [users, setUsers] = useState<UserInterface["full"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setUsers(data);
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
  }, []);
  if (loading) {
    return <div>Loading...</div>;
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
        <Link href="/admin/management">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Users
          </Button>
        </Link>
        <Link href="/admin/management/collaboration">
          <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
            Collaboration
          </Button>
        </Link>
        <Link href="/admin/management/organization">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Organization
          </Button>
        </Link>
        <Link href="/admin/management/organizationMember">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Organization member
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
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.ID}>
                    <TableCell>{user.ID}</TableCell>
                    <TableCell>{user.Username}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.Password_Hash}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total Users: {users.length}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </>
        </div>
      </div>
    </div>
  );
}
