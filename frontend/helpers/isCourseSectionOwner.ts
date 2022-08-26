import isCourseOwner from "./isCourseOwner";
import prisma from "lib/prisma";

/**
 * Is the given user (specified by their email) an owner of a the course
 *   for a specific course section?
 * @param courseSectionId Course section to check if the user is an owner of
 * @param email Email of the user to check
 * @param prismaInstance Specify a special instance of the Prisma client.
 *   E.g., `context.prisma`
 * @returns True if the user is an owner of the course section
 */
const isCourseSectionOwner = async (
  courseSectionId: string,
  email: string | undefined | null,
  prismaInstance = prisma
) => {
  const { courseId } =
    (await prismaInstance.courseSection.findUnique({
      where: {
        id: courseSectionId ?? null,
      },
      select: {
        courseId: true,
      },
    })) ?? {};

  return courseId && isCourseOwner(courseId, email, prismaInstance);
};

export default isCourseSectionOwner;
