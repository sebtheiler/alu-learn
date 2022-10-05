import prisma from "lib/prisma";

const isFriendOfCourseOwner = async (
  email: string | undefined | null,
  courseId: string
): Promise<boolean> =>
  !!email &&
  (await prisma.user.count({
    where: {
      email,
      friends: {
        some: {
          coursesOwned: {
            some: {
              id: courseId,
            },
          },
        },
      },
    },
  })) > 0;

export default isFriendOfCourseOwner;
