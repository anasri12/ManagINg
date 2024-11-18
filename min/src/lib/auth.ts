import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { db } from "./db"; // Path to your MySQL connection file

/**
 * Registers a new user in the database
 * @param {string} username - The user's username
 * @param {string} email - The user's email
 * @param {string} password - The user's plaintext password
 * @param {string|null} profilePictureUrl - Optional profile picture URL
 * @returns {Promise<string>} - The newly created user's ID
 * @throws {Error} - Throws an error if registration fails
 */
export async function registerUser(
  username: string,
  email: string,
  password: string,
  profilePictureUrl: string | null = null
): Promise<string> {
  // Input validation
  if (!username || !email || !password) {
    throw new Error("Missing username, email, or password");
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Securely hash the password
  const userId = uuidv4(); // Generate a UUID v4

  try {
    await db.query(
      `
      INSERT INTO User (ID, Username, Email, Password_Hash, Profile_Picture_URL, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [userId, username, email, hashedPassword, profilePictureUrl]
    );

    return userId; // Return the new user's ID
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("Failed to register user");
  }
}
