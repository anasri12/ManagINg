import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { queryDatabase } from "@/app/utils/db";
import { SessionSchema } from "../zods/session";

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
  try {
    SessionSchema.parse({ username, email, password, profilePictureUrl });
  } catch (validationError) {
    console.error("Validation Error:", validationError);
    throw new Error("Invalid user data provided");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = uuidv4();

  try {
    await queryDatabase(
      `
      INSERT INTO User (ID, Username, Email, Password_Hash, Profile_Picture_URL, CreatedAt, UpdatedAt)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [userId, username, email, hashedPassword, profilePictureUrl]
    );

    return userId;
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("Failed to register user");
  }
}
