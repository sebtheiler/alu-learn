import prisma from "../../../lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  jwt: {},
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }

      return token;
    },
  },
  debug: false,
  pages: {
    signIn: "/auth/sign-in",
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: "/new-user-survey", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
} as NextAuthOptions;

// eslint-disable-next-line
export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
