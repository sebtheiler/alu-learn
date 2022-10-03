import { PrismaAdapter } from "@next-auth/prisma-adapter";
import key from "creds/gsuite.json";
import createEmailTemplate from "emails/createEmailTemplate";
import sendEmail from "emails/sendEmail";
import prisma from "lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
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
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER,
        port: 465,
        secure: true,
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL_FROM,
          serviceClient: key.client_id,
          privateKey: key.private_key,
        },
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        const template = createEmailTemplate("verificationRequest");
        const html = template({
          title: "Sign In",
          url,
        });
        const result = await sendEmail({
          to: identifier,
          subject: "Sign in to Alu Learn",
          html,
        });

        const failed = result
          ? result.rejected.concat(result.pending).filter(Boolean)
          : [];
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
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
    verifyRequest: "/verify-request", // (used for check email message)
    newUser: "/new-user-survey", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
} as NextAuthOptions;

// eslint-disable-next-line
export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, authOptions);
