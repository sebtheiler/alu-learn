import { t } from "../trpc";
import { z } from "zod";
import { prisma } from "../prisma";

export const topicRouter = t.router({
  all: t.procedure.query(() =>
    prisma.topic.findMany({
      select: {
        id: true,
        title: true,
        parentArticleId: true,
        parentTopicId: true,
        childArticles: true,
        childTopics: true,
        createdAt: true,
      },
      orderBy: {
        title: "asc",
      },
    })
  ),
  byId: t.procedure
    .input(z.string())
    .query(({ input: id }) =>
      prisma.topic.findUniqueOrThrow({ where: { id } })
    ),
  create: t.procedure
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async ({ input: { title } }) =>
      prisma.topic.create({
        data: {
          title,
        },
      })
    ),
  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        title: z.optional(z.string()),
      })
    )
    .mutation(async ({ input: { id, title } }) =>
      prisma.topic.update({
        where: {
          id,
        },
        data: {
          title,
        },
      })
    ),
  rearrange: t.procedure
    .input(
      z.object({
        rearrangedTopicIds: z.array(z.string()),
        targetTopicId: z.optional(z.string().nullable()),
        targetArticleId: z.optional(z.string().nullable()),
      })
    )
    .mutation(
      async ({
        input: { rearrangedTopicIds, targetArticleId, targetTopicId },
      }) => {
        return prisma.topic.updateMany({
          where: {
            id: {
              in: rearrangedTopicIds,
            },
          },
          data: {
            parentArticleId: targetArticleId,
            parentTopicId: targetTopicId,
          },
        });
      }
    ),
  delete: t.procedure
    .input(z.string())
    .mutation(({ input: id }) => prisma.topic.delete({ where: { id } })),
});
