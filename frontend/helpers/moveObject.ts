import type { Prisma } from "@prisma/client";
import { ApolloError } from "apollo-server-micro";
import type { Context } from "graphql/context";

/**
 * Updates an object and its siblings to reorder that object.
 * // TODO: implement a better version https://softwareengineering.stackexchange.com/questions/195308/storing-a-re-orderable-list-in-a-database
 */
const moveObject = async ({
  objType,
  from,
  to,
  objQuery,
  parentQuery,
  ctx,
}: {
  objType: "FLASHCARD" | "SUB_SECTION" | "COURSE_SECTION";
  /**
   * Original index of the object
   */
  from: number;
  /**
   * Destination index of the object
   */
  to: number;
  /**
   * Query that defines how to find the target object that will be moved
   */
  objQuery: object;
  /**
   * Query that defines how to get all the sibling objects of the target object
   */
  parentQuery: object;
  /**
   * GraphQL context
   */
  ctx: Context;
}) => {
  let obj:
    | Prisma.FlashcardDelegate<
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
      >
    | Prisma.SubSectionDelegate<
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
      >
    | Prisma.CourseSectionDelegate<
        Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
      >;
  switch (objType) {
    case "FLASHCARD":
      obj = ctx.prisma.flashcard;
      break;
    case "SUB_SECTION":
      obj = ctx.prisma.subSection;
      break;
    case "COURSE_SECTION":
      obj = ctx.prisma.courseSection;
  }

  // @ts-ignore
  const numObjs = await obj.count({
    where: parentQuery,
  });

  if (from > numObjs || to > numObjs || from < 0 || to < 0) {
    throw new ApolloError("Invalid values for `from` or `to`");
  }

  // @ts-ignore
  const { id: fromObjId } = await obj.findFirstOrThrow({
    where: {
      index: from,
      ...objQuery,
    },
    select: {
      id: true,
    },
  });

  if (to > from) {
    // @ts-ignore
    await obj.updateMany({
      where: {
        ...parentQuery,
        index: {
          gt: from,
          lte: to,
        },
      },
      data: {
        index: {
          decrement: 1,
        },
      },
    });
  } else {
    // @ts-ignore
    await obj.updateMany({
      where: {
        ...parentQuery,
        index: {
          lt: from,
          gte: to,
        },
      },
      data: {
        index: {
          increment: 1,
        },
      },
    });
  }

  // @ts-ignore
  return await obj.update({
    where: {
      id: fromObjId,
    },
    data: {
      index: to,
    },
  });
};

export default moveObject;
