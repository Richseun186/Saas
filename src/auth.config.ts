import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import bcryptjs from "bcryptjs";
import { db } from "@/lib/db"; // Assuming this is safe to run on edge, if not, credentials authorize might not work in edge

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@school.edu" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordsMatch = await bcryptjs.compare(
          credentials.password as string,
          user.password
        );

        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            roles: user.roles, // Assuming roles array is returned
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles; // Extract from DB user
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
