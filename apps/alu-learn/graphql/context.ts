import prisma from "../lib/prisma";
import { PrismaClient } from "@prisma/client";
import getServerSession from "helpers/getServerSession";
import type { NextApiRequest, NextApiResponse } from "next";

export type Context = {
  user?: {
    name?: string | null | undefined;
    email?: string | null | undefined;
    image?: string | null | undefined;
  };
  accessToken?: string;
  prisma: PrismaClient;
};

const createContext = async (req: NextApiRequest, res: NextApiResponse) => ({
  req,
  res,
  prisma,
  user: await getServerSession({ req, res }).then((session) => session?.user),
});

export default createContext;

// export default async function createContext({
//   req,
//   res,
// }: {
//   req: NextApiRequest;
//   res: NextApiResponse;
// }): Promise<Context> {
//   const session = await getServerSession({ req, res });
//   if (!session) return { prisma };

//   const { user } = session;

//   return {
//     prisma,
//     user,
//   };
// }
