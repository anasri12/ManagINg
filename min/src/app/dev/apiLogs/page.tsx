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
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import Loading from "@/components/general/Loading";
import { useRouter } from "next/navigation";
import { LogInterface } from "@/app/zods/db/log";

export default function APILogs() {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const router = useRouter();
  const [logs, setLogs] = useState<LogInterface["full"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userID) return;
        const response = await fetch(`/api/logs`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setLogs(data);
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
    if (status === "loading" || status === "authenticated") {
      return <Loading />;
    } else return router.push("/home");
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = logs.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(logs.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-28 py-6 px-6">
      {/* Header */}
      <div className="font-inria text-5xl mb-8">API Usage Logs</div>

      {/* Table */}
      <div className="rounded-md border shadow-sm bg-white">
        <div className="flex items-center py-4 px-6">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>User_ID</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.map((log) => (
                <TableRow key={log.ID}>
                  <TableCell>{log.User_ID}</TableCell>
                  <TableCell>{log.Endpoint}</TableCell>
                  <TableCell>{log.Method}</TableCell>
                  <TableCell>{log.Status}</TableCell>
                  <TableCell>{log.Response_Time} ms</TableCell>
                  <TableCell>
                    {log.CreatedAt
                      ? format(new Date(log.CreatedAt), "PPP p")
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          className="bg-gray-200 text-black hover:bg-gray-300"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <Button
          className="bg-gray-200 text-black hover:bg-gray-300"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
