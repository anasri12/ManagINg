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
      <div className="font-inria text-5xl mb-8">Logs</div>

      {/* table */}
      <div className="rounded-md border shadow-sm bg-white">
        <div className="flex items-center py-4 px-6">
          <>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Transection ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
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
