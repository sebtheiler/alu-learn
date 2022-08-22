import getUserGQL from "../../lib/getUserGQL";
import { extendType, list, nonNull, objectType, stringArg } from "nexus";

const Course = objectType({
  name: "Course",
  definition(t) {
    t.string("id");
    t.string("title");
    // t.string("imageBanner");
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
    t.field("mainSections", {
      type: list("MainSection"),
      resolve(course, _args, ctx) {
        return ctx.prisma.mainSection.findMany({
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
    t.list.field("courses", {
      type: Course,
      description: "Gets all available courses",
      async resolve(_parent, _args, ctx) {
        return ctx.prisma.course.findMany();
      },
    });
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
        const mainSection = await ctx.prisma.mainSection.create({
          data: {
            title: "Default",
            courseId: course.id,
          },
        });

        await ctx.prisma.subSection.create({
          data: {
            title: "Default",
            mainSectionId: mainSection.id,
          },
        });

        return course;
      },
    });
  },
});

export default Course;
