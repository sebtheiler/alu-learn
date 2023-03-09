import { t } from "../trpc";
import { z } from "zod";
import { prisma } from "../prisma";

export const extractRouter = t.router({
  all: t.procedure
    .input(
      z.optional(
        z.object({
          parentArticleId: z.optional(z.string()),
          parentExtractId: z.optional(z.string()),
        })
      )
    )
    .query(({ input }) =>
      prisma.extract.findMany({
        where: {
          parentArticleId: input?.parentArticleId ?? undefined,
          parentExtractId: input?.parentExtractId ?? undefined,
        },
        select: {
          type: true,
          data: true,
          childExtracts: true,
          identifier: true,
          parentArticleId: true,
          parentExtractId: true,
          createdAt: true,
          priority: true,
          lastReview: true,
          nextReview: true,
          aFactor: true,
          id: true,
        },
      })
    ),
  byId: t.procedure.input(z.string()).query(({ input: id }) =>
    prisma.extract.findUniqueOrThrow({
      where: { id },
      select: {
        type: true,
        data: true,
        childExtracts: true,
        identifier: true,
        parentArticleId: true,
        parentArticle: true,
        parentExtractId: true,
        createdAt: true,
        priority: true,
        lastReview: true,
        nextReview: true,
        aFactor: true,
        id: true,
      },
    })
  ),
  create: t.procedure
    .input(
      z.object({
        type: z.string(),
        data: z.string(),
        identifier: z.optional(z.string()),
        parentArticleId: z.optional(z.string()),
        parentExtractId: z.optional(z.string()),
      })
    )
    .mutation(
      ({
        input: { type, data, identifier, parentArticleId, parentExtractId },
      }) =>
        prisma.extract.create({
          data: {
            type,
            data,
            identifier,
            parentArticleId,
            parentExtractId,
          },
        })
    ),
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        data: z.optional(z.string()),
      })
    )
    .mutation(({ input: { id, data } }) =>
      prisma.extract.update({
        where: {
          id,
        },
        data: {
          data,
        },
      })
    ),
  delete: t.procedure
    .input(z.string())
    .mutation(({ input: id }) => prisma.extract.delete({ where: { id } })),
});
