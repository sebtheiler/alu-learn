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
      resolve(course, _args, ctx) {
        return ctx.prisma.user.findMany({
          where: {
            courses: {
              some: {
                id: course.id as string,
              },
            },
          },
        });
      },
    });
    t.field("owners", {
      type: list("User"),
      resolve(course, _args, ctx) {
        return ctx.prisma.user.findMany({
          where: {
            coursesOwned: {
              some: {
                id: course.id as string,
              },
            },
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
      async resolve(_parent, _args, ctx) {
        return ctx.prisma.course.findMany();
      },
    });
    t.list.field("myCourses", {
      type: Course,
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
      args: {
        title: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        return ctx.prisma.course.create({
          data: {
            title: args.title as string,

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
      },
    });
  },
});

export default Course;
