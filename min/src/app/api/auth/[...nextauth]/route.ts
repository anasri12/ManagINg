import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { queryDatabase } from "@/app/utils/db";
import { UserInterface, UserSchema } from "../../../zods/db/user";

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
          const [user] = await queryDatabase<UserInterface["full"]>(
            `SELECT * FROM User WHERE Username = ? OR Email = ? LIMIT 1`,
            [identifier, identifier]
          );

          if (!user) throw new Error("Invalid username/email or password");

          const isValid = await bcrypt.compare(password, user.Password_Hash);
          if (!isValid) throw new Error("Invalid username/email or password");

          return {
            id: user.ID,
            name: user.Username,
            email: user.Email,
            image: user.Profile_Picture_URL,
            role: user.Role,
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
          const [dbUser] = await queryDatabase<UserInterface["full"]>(
            `SELECT Role FROM User WHERE ID = ? LIMIT 1`,
            [token.id]
          );
          token.role = dbUser?.Role;
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        try {
          const [dbUser] = await queryDatabase<UserInterface["full"]>(
            `SELECT ID, Username, Email, Profile_Picture_URL, Role FROM User WHERE ID = ? LIMIT 1`,
            [token.id]
          );

          if (dbUser) {
            session.user = {
              id: dbUser.ID,
              name: dbUser.Username,
              email: dbUser.Email,
              image: dbUser.Profile_Picture_URL ?? "/profile.png",
              role: dbUser.Role,
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
