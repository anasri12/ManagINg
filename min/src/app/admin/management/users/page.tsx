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
import Loading from "@/components/general/Loading";

export default function Users() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserInterface["full"][]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const recordsPerPage = 4;

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session) return;
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
  }, [session]);

  // Pagination logic
  const totalPages = Math.ceil(users.length / recordsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // Handle role update
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      if (!session) return;
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role.");
      }
      alert("Role updated successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role.");
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      if (!session) return;
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user.");
      }

      alert("User deleted successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-28 py-6 px-6">
      {/* Header */}
      <div className="font-inria text-5xl mb-8">Management</div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Link href="/admin/management/users">
          <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
            Users
          </Button>
        </Link>
        <Link href="/admin/management/collaborations">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Collaborations
          </Button>
        </Link>
        <Link href="/admin/management/inventories">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Inventories
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-md border shadow-sm bg-white">
        <div className="flex items-center py-4 px-6">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Profile_Picture_URL</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.ID}>
                  <TableCell>{user.ID}</TableCell>
                  <TableCell>{user.Username}</TableCell>
                  <TableCell>{user.Email}</TableCell>
                  <TableCell>{user.Password_Hash}</TableCell>
                  <TableCell>{user.Profile_Picture_URL ?? "-"}</TableCell>
                  <TableCell>
                    <select
                      value={user.Role}
                      onChange={(e) =>
                        handleUpdateRole(user.ID, e.target.value)
                      }
                      className="border rounded-md p-1"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Developer">Developer</option>
                      <option value="User">User</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button
                      className="bg-red-600 text-white hover:bg-red-700 px-2 py-1"
                      onClick={() => handleDeleteUser(user.ID)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total Users: {users.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
