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

type UserType = {
  ID: string;
  Username: string;
  Email: string;
  Password_Hash: string;
  Profile_Picture_URL: string;
  CreatedAt: string;
  UpdatedAt: string;
  Role: string;
};

export default function Users() {
  const [users, setUsers] = useState([]); // State to store student data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState<null | string>(null); // State for error

  useEffect(() => {
    // Fetch data from the API when the component mounts
    const fetchData = async () => {
      try {
        const response = await fetch("/api/users"); // Fetch from the API
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json(); // Parse JSON data
        setUsers(data); // Set the fetched data to state
        setLoading(false); // Set loading to false
      } catch (error) {
        // Narrow the type of error
        if (error instanceof Error) {
          setError(error.message); // Set the error message
        } else {
          setError("An unknown error occurred"); // Fallback for unexpected error types
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
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Password</TableHead>
            <TableHead>Profile_Picture_URL</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: UserType) => (
            <TableRow key={user.ID}>
              <TableCell>{user.ID}</TableCell>
              <TableCell>{user.Username}</TableCell>
              <TableCell>{user.Email}</TableCell>
              <TableCell>{user.Password_Hash}</TableCell>
              <TableCell>{user.Profile_Picture_URL ?? "-"}</TableCell>
              <TableCell>{user.Role}</TableCell>
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
  );
}
