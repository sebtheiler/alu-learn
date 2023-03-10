import { t } from "../trpc";
import fs from "fs/promises";
import { z } from "zod";
import { prisma } from "../prisma";

export const articleRouter = t.router({
  all: t.procedure.query(() =>
    prisma.article.findMany({
      select: {
        id: true,
        type: true,
        title: true,
        byline: true,
        originUrl: true,
        dataPath: true,
        readingPoint: true,
        // TODO: Fetching all of these right now is very inefficient
        // Will need to replace with lazy loading in the tree later
        // (same with topics query)
        parentArticleId: true,
        parentTopicId: true,
        childArticles: true,
        childTopics: true,
        extracts: true,
        createdAt: true,
        priority: true,
        lastReview: true,
        nextReview: true,
        aFactor: true,
        finishedLearning: true,
      },
      orderBy: {
        title: "asc",
      },
    })
  ),
  byId: t.procedure
    .input(z.string())
    .query(({ input: id }) =>
      prisma.article.findUniqueOrThrow({ where: { id } })
    ),
  create: t.procedure
    .input(
      z.object({
        type: z.string(),
        title: z.string(),
        byline: z.optional(z.string()),
        originUrl: z.optional(z.string()),
        dataPath: z.string(),
      })
    )
    .mutation(async ({ input: { type, title, byline, originUrl, dataPath } }) =>
      prisma.article.create({
        data: {
          type,
          title,
          byline,
          originUrl,
          dataPath,
        },
      })
    ),
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        title: z.optional(z.string()),
        byline: z.optional(z.string()),
        readingPoint: z.optional(z.string()),
      })
    )
    .mutation(async ({ input: { id, title, byline, readingPoint } }) => {
      const article = await prisma.article.update({
        where: {
          id,
        },
        data: {
          title,
          byline,
          readingPoint,
        },
      });

      return article;
    }),
  rearrange: t.procedure
    .input(
      z.object({
        rearrangedArticleIds: z.array(z.string()),
        targetArticleId: z.string().nullable(),
        targetTopicId: z.string().nullable(),
      })
    )
    .mutation(
      async ({
        input: { rearrangedArticleIds, targetArticleId, targetTopicId },
      }) => {
        return prisma.article.updateMany({
          where: {
            id: {
              in: rearrangedArticleIds,
            },
          },
          data: {
            parentArticleId: targetArticleId,
            parentTopicId: targetTopicId,
          },
        });
      }
    ),
  delete: t.procedure.input(z.string()).mutation(async ({ input: id }) => {
    const article = await prisma.article.findUniqueOrThrow({
      where: { id },
      select: { type: true, dataPath: true },
    });
    if (["LEXICAL", "PDF"].includes(article.type)) fs.unlink(article.dataPath);
    return prisma.article.delete({ where: { id } });
  }),
});
