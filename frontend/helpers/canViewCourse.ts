import isCourseUser from "./isCourseUser";
import isFriendOfCourseOwner from "./isFriendOfCourseOwner";
import type { PrivacySetting } from "@prisma/client";
import prisma from "lib/prisma";

/**
 * Does the given user (specified by their email) have access to view a given course?
 * @param courseId Course to check if the user is a user of
 * @param email Email of the user to check
 * @returns True if the user is a member of the course
 */
const canViewCourse = async (
  courseId: string,
  email: string | undefined | null,
  prismaInstance = prisma
) => {
  const course = await prismaInstance.course.findUnique({
    where: { id: courseId },
    select: { privacySetting: true },
  });
  if (!course) return null;

  const { privacySetting } = course;
  switch (privacySetting as PrivacySetting) {
    case "ALL":
      return true;
    case "FRIENDS":
      return isFriendOfCourseOwner(email, courseId);
    case "INSTITUTION":
      return;
    case "PASSWORD":
      return;
    case "PRIVATE":
      return isCourseUser(courseId, email, prismaInstance);
    default:
      return false;
  }
};

export default canViewCourse;
