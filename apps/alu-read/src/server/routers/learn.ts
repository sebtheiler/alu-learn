import { prisma } from "../prisma";
import calcNextObjectInterval from "../calcNextObjectInterval";
import { t } from "../trpc";
import { z } from "zod";

// TODO: change these types
/**
 * Model Article
 *
 */
export type Article = {
  id: string;
  type: string;
  title: string;
  byline: string | null;
  originUrl: string | null;
  createdAt: Date;
  dataPath: string;
  readingPoint: string | null;
  lastReview: Date | null;
  nextReview: Date;
  priority: number | null;
  aFactor: number;
  parentArticleId: string | null;
  parentTopicId: string | null;
};

/**
 * Model Extract
 *
 */
export type Extract = {
  id: string;
  type: string;
  data: string;
  identifier: string | null;
  createdAt: Date;
  lastReview: Date | null;
  nextReview: Date;
  priority: number | null;
  aFactor: number;
  parentArticleId: string | null;
  parentExtractId: string | null;
};

export type MergedObject =
  | (Article & { objectType: "ARTICLE" })
  | (Extract & { objectType: "EXTRACT" });

export const learnRouter = t.router({
  nextObject: t.procedure
    .input(
      z.object({
        currentObjectId: z.string().nullable(),
        currentObjectType: z.string().nullable(),
        nextReviewInDays: z.optional(z.number()),
        priority: z.optional(z.number().nullable()),
        aFactor: z.optional(z.number()),
      })
    )
    .mutation(
      async ({
        input: {
          currentObjectId,
          currentObjectType,
          nextReviewInDays,
          priority,
          aFactor,
        },
      }) => {
        const object = currentObjectId
          ? await (currentObjectType === "ARTICLE"
              ? prisma.article.findUniqueOrThrow({
                  where: { id: currentObjectId },
                })
              : prisma.extract.findUniqueOrThrow({
                  where: { id: currentObjectId },
                }))
          : null;

        // Shift priority of other objects
        if (
          typeof priority === "number" &&
          object &&
          priority !== object.priority
        ) {
          const articles = await prisma.article.findMany({
            where: { priority: { gte: priority }, id: { not: object.id } },
          });
          const extracts = await prisma.extract.findMany({
            where: { priority: { gte: priority }, id: { not: object.id } },
          });
          const objects = articles
            .map<MergedObject>((a) => ({ objectType: "ARTICLE", ...a }))
            .concat(extracts.map((e) => ({ objectType: "EXTRACT", ...e })))
            .sort((a, b) => (a.priority as number) - (b.priority as number));

          // Increment the priority of subsequent objects until a "gap" opens due to the non-sequential nature of priorities
          const toIncrementPriority: MergedObject[] = [];
          let i = 0;
          let prevPriorty = priority;
          while (objects[i] && objects[i].priority === prevPriorty) {
            toIncrementPriority.push(objects[i]);
            i++;
            if (i === objects.length) {
              break;
            }
            prevPriorty = objects[i].priority as number;
          }

          if (toIncrementPriority.length > 0) {
            await prisma.article.updateMany({
              where: {
                id: {
                  in: toIncrementPriority
                    .filter((o) => o.objectType === "ARTICLE")
                    .map((a) => a.id),
                },
              },
              data: {
                priority: {
                  increment: 1,
                },
              },
            });
            await prisma.extract.updateMany({
              where: {
                id: {
                  in: toIncrementPriority
                    .filter((o) => o.objectType === "EXTRACT")
                    .map((e) => e.id),
                },
              },
              data: {
                priority: {
                  increment: 1,
                },
              },
            });
          }
        }

        // Update current object
        if (currentObjectId) {
          const nextReview = new Date();
          nextReview.setDate(
            nextReview.getDate() +
              (nextReviewInDays ??
                calcNextObjectInterval({
                  objectType: currentObjectType,
                  ...object,
                } as MergedObject))
          );
          if (currentObjectType === "ARTICLE")
            await prisma.article.update({
              where: {
                id: currentObjectId,
              },
              data: {
                nextReview,
                priority,
                aFactor,
              },
            });
          else
            await prisma.extract.update({
              where: {
                id: currentObjectId,
              },
              data: {
                nextReview,
                priority,
                aFactor,
              },
            });

          // Track review of current object
          await prisma.review.create({
            data: {
              priority: priority ?? null,
              nextReview: nextReview ?? null,
              articleId:
                currentObjectType === "ARTICLE" ? currentObjectId : undefined,
              extractId:
                currentObjectType === "EXTRACT" ? currentObjectId : undefined,
            },
          });
        }

        // Get next object
        const now = new Date();
        const outstandingArticles = (
          await prisma.article.findMany({
            // where: {
            //   nextReview: {
            //     lte: now,
            //   },
            // },
          })
        ).filter((a) => a.nextReview.getTime() <= now.getTime());
        const outstandingExtracts = (
          await prisma.extract.findMany({
            // where: {
            //   nextReview: {
            //     lte: now,
            //   },
            // },
          })
        ).filter((e) => e.nextReview.getTime() <= now.getTime());

        const outstanding: MergedObject[] = outstandingArticles
          .map<MergedObject>((article) => ({
            objectType: "ARTICLE",
            ...article,
          }))
          .concat(
            outstandingExtracts.map<MergedObject>((extract) => ({
              objectType: "EXTRACT",
              ...extract,
            }))
          )
          .sort(() => Math.random() - 0.5)
          .sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));

        return outstanding[0];
      }
    ),
});
