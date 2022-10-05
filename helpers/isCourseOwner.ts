import prisma from "lib/prisma";

/**
 * Is the given user (specified by their email) an owner of a given course?
 * @param courseId Course to check if the user is an owner of
 * @param email Email of the user to check
 * @param prismaInstance Specify a special instance of the Prisma client.
 *   E.g., `context.prisma`
 * @returns True if the user is an owner of the course
 */
const isCourseOwner = async (
  courseId: string,
  email: string | undefined | null,
  prismaInstance = prisma
) =>
  email
    ? (await prismaInstance.user.count({
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
