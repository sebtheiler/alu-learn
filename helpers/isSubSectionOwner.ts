import isCourseSectionOwner from "./isCourseSectionOwner";
import prisma from "lib/prisma";

/**
 * Is the given user (specified by their email) an owner of a the course
 *   for a specific sub section?
 * @param subSectionId Sub section to check if the user is an owner of
 * @param email Email of the user to check
 * @param prismaInstance Specify a special instance of the Prisma client.
 *   E.g., `context.prisma`
 * @returns True if the user is an owner of the sub section
 */
const isSubSectionOwner = async (
  subSectionId: string,
  email: string | undefined | null,
  prismaInstance = prisma
) => {
  const { courseSectionId } =
    (await prismaInstance.subSection.findUnique({
      where: {
        id: subSectionId ?? null,
      },
      select: {
        courseSectionId: true,
      },
    })) ?? {};

  return (
    courseSectionId &&
    isCourseSectionOwner(courseSectionId, email, prismaInstance)
  );
};

export default isSubSectionOwner;
