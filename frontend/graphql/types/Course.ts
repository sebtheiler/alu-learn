import type { Course as PrismaCourse } from "@prisma/client";
import { ApolloError } from "apollo-server-micro";
import deleteFileFromS3 from "helpers/deleteFileFromS3";
import generateSignedS3URL from "helpers/generateSignedS3URL";
import getUserGQL from "helpers/getUserGQL";
import isCourseOwner from "helpers/isCourseOwner";
import isCourseUser from "helpers/isCourseUser";
import slugifyText from "helpers/slugifyText";
import uploadImageToS3 from "helpers/uploadImageToS3";
import {
  arg,
  booleanArg,
  enumType,
  extendType,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

const Course = objectType({
  name: "Course",
  definition(t) {
    t.string("id");
    t.string("title");
    t.field("privacySetting", { type: PrivacySetting });
    t.field("editingAccess", { type: EditingAccess });
    t.string("description");
    t.string("bannerImage", {
      resolve(course) {
        // @ts-ignore
        return generateSignedS3URL(course.bannerImage);
      },
    });
    t.field("users", {
      type: list("User"),
      description: "Users who have studying or teaching this course",
      resolve(course, _args, ctx) {
        return ctx.prisma.user.findMany({
          where: {
            courses: {
              some: {
                id: course.id ?? "",
              },
            },
          },
        });
      },
    });
    t.field("owners", {
      type: list("User"),
      description: "Users who have full privileges on this course",
      resolve(course, _args, ctx) {
        return ctx.prisma.user.findMany({
          where: {
            coursesOwned: {
              some: {
                id: course.id ?? "",
              },
            },
          },
        });
      },
    });
    t.field("courseSections", {
      type: list("CourseSection"),
      resolve(course, _args, ctx) {
        return ctx.prisma.courseSection.findMany({
          where: {
            courseId: course.id ?? "",
          },
        });
      },
    });
  },
});

export const CoursesQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("myCourses", {
      type: Course,
      description: "Get the current user's courses",
      resolve(_parent, _args, ctx) {
        return ctx.prisma.course.findMany({
          where: {
            users: {
              some: {
                email: ctx.user?.email,
              },
            },
          },
        });
      },
    });
    t.list.field("searchCourses", {
      type: Course,
      description: "Search for shared courses based on their title",
      args: {
        title: nonNull(stringArg()),
      },
      resolve(_parent, args, ctx) {
        if (args.title.length < 3) return null;
        return ctx.prisma.course.findMany({
          where: {
            title: {
              contains: args.title,
              mode: "insensitive",
            },
          },
          take: 25,
        });
      },
    });
  },
});

export const CoursesMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createCourse", {
      type: "Course",
      description:
        "Creates a course and populates it with an initial main and sub section",
      args: {
        title: nonNull(
          stringArg({ description: "Title of the course to create" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const course = await ctx.prisma.course.create({
          data: {
            title: args.title ?? "",

            // The current user is a user and an owner of the new course
            users: {
              connect: {
                id: user.id,
              },
            },
            owners: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        // Populate the course with a default main and subsection
        const defaultSectionTitle = "Default";

        const courseSection = await ctx.prisma.courseSection.create({
          data: {
            title: defaultSectionTitle,
            courseId: course.id,
            slug: slugifyText(defaultSectionTitle),
            index: 0,
          },
        });

        await ctx.prisma.subSection.create({
          data: {
            title: "Default",
            courseSectionId: courseSection.id,
            slug: slugifyText(defaultSectionTitle),
            index: 0,
          },
        });

        return course;
      },
    });
    t.field("updateCourse", {
      type: "Course",
      description: "Change a course's settings",
      args: {
        title: stringArg(),
        privacySetting: arg({ type: PrivacySetting }),
        editingAccess: arg({ type: EditingAccess }),
        coursePassword: stringArg(),
        description: stringArg(),
        courseId: nonNull(
          stringArg({ description: "ID of the course to update" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseOwner(args.courseId, ctx.user?.email, ctx.prisma))
          return null;

        const data: Partial<PrismaCourse> = {};
        if (args.title != null) data.title = args.title;
        if (args.privacySetting != null)
          data.privacySetting = args.privacySetting;
        if (args.editingAccess != null) data.editingAccess = args.editingAccess;
        if (args.coursePassword != null)
          data.coursePassword = args.coursePassword;
        if (args.description != null) data.description = args.description;

        return ctx.prisma.course.update({
          where: { id: args.courseId },
          data,
        });
      },
    });
    t.field("deleteCourse", {
      type: "Course",
      description:
        "Removes the current user from a course if the course has other users.  If the course has no other users, deletes the course.",
      args: {
        courseId: nonNull(
          stringArg({ description: "ID of the course to delete" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        const numUsers = await ctx.prisma.user.count({
          where: {
            courses: {
              some: {
                id: args.courseId,
              },
            },
          },
        });

        if (numUsers > 1) {
          // Remove the current user from the course if the current user is the only user
          return ctx.prisma.course.update({
            where: {
              id: args.courseId,
            },
            data: {
              users: {
                disconnect: {
                  id: user.id,
                },
              },
            },
          });
        } else {
          // Delete the course (if the current user is the course owner)
          if (!isCourseOwner(args.courseId, ctx.user?.email, ctx.prisma))
            return null;
          return ctx.prisma.course.delete({
            where: {
              id: args.courseId,
            },
          });
        }
      },
    });
    t.field("uploadCourseBannerImage", {
      type: "Course",
      description: "Upload a banner image for a course",
      args: {
        bannerImage: arg({
          type: "Upload",
          description:
            "File object to stream upload.  If `null`, removes the course banner image.",
        }),
        courseId: nonNull(
          stringArg({ description: "ID of the course to add the bannner to" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseOwner(args.courseId, ctx.user?.email, ctx.prisma))
          return null;

        // If the `bannerImage` is null, remove the course's banner and delete the associated file
        if (args.bannerImage === null) {
          const { bannerImage: bannerImageFilename } =
            (await ctx.prisma.course.findUnique({
              where: {
                id: args.courseId,
              },
              select: {
                bannerImage: true,
              },
            })) ?? {};
          if (!bannerImageFilename) return null;

          deleteFileFromS3(bannerImageFilename);

          return ctx.prisma.course.update({
            where: {
              id: args.courseId,
            },
            data: {
              bannerImage: null,
            },
          });
        }

        // Upload the image
        try {
          const bannerImageFilename = genCourseBannerFilename(args.courseId);
          await uploadImageToS3(args.bannerImage, bannerImageFilename);

          return ctx.prisma.course.update({
            where: {
              id: args.courseId,
            },
            data: {
              bannerImage: bannerImageFilename,
            },
          });
        } catch (error) {
          throw new ApolloError(`Upload failed: ${(error as any).message}`);
        }
      },
    });
    t.field("addCourseOwner", {
      type: "User",
      description: "Adds a user as a course owner",
      args: {
        username: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        if (!isCourseOwner(args.courseId, ctx.user?.email, ctx.prisma))
          return null;

        return ctx.prisma.course.update({
          where: {
            id: args.courseId,
          },
          data: {
            owners: {
              connect: {
                username: args.username,
              },
            },
          },
        });
      },
    });
    t.field("removeCourseOwner", {
      type: "User",
      description: "Removes a user as a course owner",
      args: {
        username: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        if (!isCourseOwner(args.courseId, ctx.user?.email, ctx.prisma))
          return null;

        return ctx.prisma.course.update({
          where: {
            id: args.courseId,
          },
          data: {
            owners: {
              disconnect: {
                username: args.username,
              },
            },
          },
        });
      },
    });
    t.field("archiveCourse", {
      type: "Course",
      description:
        "Archives a course for the current user. Does not affect ownership",
      args: {
        courseId: nonNull(stringArg()),
        archive: nonNull(booleanArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (!user) return null;

        if (args.archive) {
          if (!isCourseUser(args.courseId, ctx.user?.email, ctx.prisma))
            return null;
          return ctx.prisma.course.update({
            where: {
              id: args.courseId,
            },
            data: {
              users: {
                disconnect: {
                  id: user.id,
                },
              },
              archivedUsers: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        } else {
          if (
            (await ctx.prisma.user.count({
              where: {
                email: ctx.user?.email ?? null,
                coursesArchived: {
                  some: {
                    id: args.courseId ?? null,
                  },
                },
              },
            })) === 0
          )
            return null;
          return ctx.prisma.course.update({
            where: {
              id: args.courseId,
            },
            data: {
              users: {
                connect: {
                  id: user.id,
                },
              },
              archivedUsers: {
                disconnect: {
                  id: user.id,
                },
              },
            },
          });
        }
      },
    });
  },
});

export default Course;

const genCourseBannerFilename = (courseId: string) =>
  `courseBannerImages/course-${courseId}-bannerImage`;

export const PrivacySetting = enumType({
  name: "PrivacySetting",
  members: ["ALL", "PASSWORD", "FRIENDS", "INSTITUTION", "PRIVATE"],
});

export const EditingAccess = enumType({
  name: "EditingAccess",
  members: ["OWNERS", "ALL", "FRIENDS", "INSTITUTION"],
});
