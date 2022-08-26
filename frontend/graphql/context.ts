import prisma from "../lib/prisma";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";

export type Context = {
  user?: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  };
  accessToken?: string;
  prisma: PrismaClient;
};

export default async function createContext({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<Context> {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) return { prisma };

  const { user } = session;

  return {
    prisma,
    user,
  };
}
