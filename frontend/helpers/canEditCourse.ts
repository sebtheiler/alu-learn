import isCourseUser from "./isCourseUser";
import prisma from "lib/prisma";

/**
 * Does the given user (specified by their email) have access to view a given course?
 * @param courseId Course to check if the user is a user of
 * @param email Email of the user to check
 * @returns True if the user is a member of the course
 */
const canEditCourse = async (
  courseId: string,
  email: string | undefined | null,
  prismaInstance = prisma
) => {
  const course = await prismaInstance.course.findUnique({
    where: { id: courseId },
    select: { editingAccess: true },
  });
  if (!course) return null;

  const { editingAccess } = course;
  switch (editingAccess) {
    case "ALL":
      return true;
    case "FRIENDS":
      // TODO
      return null;
    case "INSTITUTION":
      return;
    case "OWNERS":
      return isCourseUser(courseId, email, prismaInstance);
    default:
      return false;
  }
};

export default canEditCourse;
