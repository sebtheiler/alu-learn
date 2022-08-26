import prisma from "./prisma";

/**
 * Is the given user (specified by their email) a user of a given course?
 * @param courseId Course to check if the user is a user of
 * @param email Email of the user to check
 * @returns True if the user is a member of the course
 */
const isCourseUser = async (
  courseId: string,
  email: string | undefined | null
) =>
  email
    ? (await prisma.user.count({
        where: {
          email: email ?? null,
          courses: {
            some: {
              id: courseId ?? "",
            },
          },
        },
      })) > 0
    : null;

export default isCourseUser;
