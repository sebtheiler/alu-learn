import isCourseUser from "./isCourseUser";
import prisma from "lib/prisma";

/**
 * Is the given user (specified by their email) a user of the course
 *   for a specific course section?
 * @param courseSectionId Course section to check if the user is a user of
 * @param email Email of the user to check
 * @param prismaInstance Specify a special instance of the Prisma client.
 *   E.g., `context.prisma`
 * @returns True if the user is a user of the course section
 */
const isCourseSectionUser = async (
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

  return courseId && isCourseUser(courseId, email, prismaInstance);
};

export default isCourseSectionUser;
