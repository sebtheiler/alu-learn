import prisma from "../lib/prisma";
import { PrismaClient } from "@prisma/client";

export type Context = {
  prisma: PrismaClient;
};
export default async function createContext({ req, res }): Promise<Context> {
  return {
    prisma,
  };
}
