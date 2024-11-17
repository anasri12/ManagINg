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

interface studentType {
  student_ID: string;
  first_name: string;
  last_name: string;
  dept_code: string;
}
export default function Students() {
  const [students, setStudents] = useState([]); // State to store student data
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState<null | string>(null); // State for error

  useEffect(() => {
    // Fetch data from the API when the component mounts
    const fetchData = async () => {
      try {
        const response = await fetch("/api/students"); // Fetch from the API
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json(); // Parse JSON data
        setStudents(data); // Set the fetched data to state
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
            <TableHead>Student ID</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Dept Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student: studentType) => (
            <TableRow key={student.student_ID}>
              <TableCell>{student.student_ID}</TableCell>
              <TableCell>{student.first_name}</TableCell>
              <TableCell>{student.last_name}</TableCell>
              <TableCell>{student.dept_code}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total Students: {students.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
