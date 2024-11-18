import mysql, { Pool } from "mysql2/promise";

// Type-safe environment variables
const {
  DATABASE_HOST,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  DATABASE_PORT,
} = process.env;

if (
  !DATABASE_HOST ||
  !DATABASE_USER ||
  !DATABASE_PASSWORD ||
  !DATABASE_NAME ||
  !DATABASE_PORT
) {
  throw new Error("Missing database configuration environment variables");
}

// Create a MySQL connection pool
export const db: Pool = mysql.createPool({
  host: DATABASE_HOST,
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  port: parseInt(DATABASE_PORT, 10),
  waitForConnections: true,
  connectionLimit: 10,
});
