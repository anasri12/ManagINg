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

export default function API() {
  const [users, setUsers] = useState<UserInterface["full"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  return (
    <div className="container mx-28 py-6 px-6">
      {/* Header */}
      <div className="font-inria text-5xl mb-8">API Usage</div>

      {/* table */}
      <div className="rounded-md border shadow-sm bg-white">
        <div className="flex items-center py-4 px-6">
          <>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>method</TableHead>
                  <TableHead>Status code</TableHead>
                  <TableHead>Response time</TableHead>
                  <TableHead>Create at</TableHead>
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
