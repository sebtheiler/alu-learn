import prisma from "./prisma";

/**
 * Is the given user (specified by their email) an owner of a given course?
 * @param courseId Course to check if the user is an owner of
 * @param email Email of the user to check
 * @returns True if the user is an owner of the course
 */
const isCourseOwner = async (
  courseId: string,
  email: string | undefined | null
) =>
  email
    ? (await prisma.user.count({
        where: {
          email: email ?? null,
          coursesOwned: {
            some: {
              id: courseId ?? "",
            },
          },
        },
      })) > 0
    : null;

export default isCourseOwner;
