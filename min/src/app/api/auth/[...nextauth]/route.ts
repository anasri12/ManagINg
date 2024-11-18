import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "@/lib/db"; // Adjust the path to your database connection

interface User {
  ID: string;
  Username: string;
  Email: string;
  Profile_Picture_URL: string | null;
  Password_Hash: string;
  Role: string;
}

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string; // Include role
    };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing identifier or password");
        }

        const { identifier, password } = credentials;

        try {
          // Query user by username or email
          const [rows] = await db.query(
            `SELECT * FROM User WHERE Username = ? OR Email = ? LIMIT 1`,
            [identifier, identifier]
          );
          const user = (rows as User[])[0];
          if (!user) throw new Error("Invalid username/email or password");

          // Compare hashed password
          const isValid = await bcrypt.compare(password, user.Password_Hash);
          if (!isValid) throw new Error("Invalid username/email or password");

          // Return user object with ID
          return {
            id: user.ID,
            name: user.Username,
            email: user.Email,
            image: user.Profile_Picture_URL,
          };
        } catch (error) {
          console.error("Error in credentials provider:", error);
          throw new Error("Internal server error");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Attach user ID to the token
      }

      // Query the role using the user ID in the token
      if (token.id) {
        try {
          const [rows] = await db.query(
            `SELECT Role FROM User WHERE ID = ? LIMIT 1`,
            [token.id]
          );
          const dbUser = (rows as User[])[0];
          token.role = dbUser?.Role || "User"; // Default to "user" if no role is found
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id && token?.role) {
        session.user = {
          id: token.id as string,
          name: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image || undefined,
          role: token.role as string, // Attach role to session
        };
      }
      return session;
    },
  },
};

// Default export for NextAuth
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
