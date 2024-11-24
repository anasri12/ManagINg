import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { queryDatabase } from "@/app/utils/db";
import { UserInterface } from "../../../zods/db/user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: string;
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
          const user = await queryDatabase<UserInterface["full"]>(
            `SELECT * FROM User WHERE Username = ? OR Email = ? LIMIT 1`,
            [identifier, identifier]
          );

          if (!Array.isArray(user)) {
            throw new Error(
              "Unexpected query result: Expected an array, but got a ResultSetHeader."
            );
          }

          if (!user) throw new Error("Invalid username/email or password");

          const isValid = await bcrypt.compare(password, user[0].Password_Hash);
          if (!isValid) throw new Error("Invalid username/email or password");

          return {
            id: user[0].ID,
            name: user[0].Username,
            email: user[0].Email,
            image: user[0].Profile_Picture_URL,
            role: user[0].Role,
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
    strategy: "jwt",
    maxAge: 30 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      if (token.id) {
        try {
          const dbUser = await queryDatabase<UserInterface["full"]>(
            `SELECT Role FROM User WHERE ID = ? LIMIT 1`,
            [token.id]
          );
          if (!Array.isArray(dbUser)) {
            throw new Error(
              "Unexpected query result: Expected an array, but got a ResultSetHeader."
            );
          }
          token.role = dbUser[0].Role;
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        try {
          const dbUser = await queryDatabase<UserInterface["full"]>(
            `SELECT ID, Username, Email, Profile_Picture_URL, Role FROM User WHERE ID = ? LIMIT 1`,
            [token.id]
          );

          if (!Array.isArray(dbUser)) {
            throw new Error(
              "Unexpected query result: Expected an array, but got a ResultSetHeader."
            );
          }

          if (dbUser) {
            session.user = {
              id: dbUser[0].ID,
              name: dbUser[0].Username,
              email: dbUser[0].Email,
              image: dbUser[0].Profile_Picture_URL ?? "/profile.png",
              role: dbUser[0].Role,
            };
          }
        } catch (error) {
          console.error("Error fetching session user data:", error);
        }
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
