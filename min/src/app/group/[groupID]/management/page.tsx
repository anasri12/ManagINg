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
import { OrganizationMemberInterface } from "@/app/zods/db/organizationMember";
import { useSession } from "next-auth/react";

export default function GroupManagement({
  params,
}: {
  params: { groupID: string };
}) {
  const { data: session } = useSession();
  const [members, setMembers] = useState<OrganizationMemberInterface["full"][]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/organizations/${params.groupID}/organizationMembers`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setMembers(data);
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
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>User_ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.ID}>
              <TableCell>{member.ID}</TableCell>
              <TableCell>{member.Role}</TableCell>
              <TableCell>{member.User_ID}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total Users: {members.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}
