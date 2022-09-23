import type { Classroom as PrismaClassroom } from "@prisma/client";
import getRandomString from "helpers/getRandomString";
import { extendType, nonNull, objectType, stringArg } from "nexus";

const Classroom = objectType({
  name: "Classroom",
  definition(t) {
    t.string("id");
    t.string("title");
    t.string("joinCode");
    t.string("courseId");
  },
});

export default Classroom;

export const ClassroomsMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createClassroom", {
      type: Classroom,
      description: "Creates a classroom",
      args: {
        title: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        if (!ctx.user) return null;

        const joinCode = getRandomString(8, "upper");

        return ctx.prisma.classroom.create({
          data: {
            title: args.title,
            joinCode,
            courseId: args.courseId,
            teachers: {
              connect: {
                email: ctx.user.email as string,
              },
            },
          },
        });
      },
    });
    t.field("updateClassroom", {
      type: Classroom,
      description: "Updates a classrooms values",
      args: {
        classroomId: nonNull(
          stringArg({ description: "ID of the classroom to update" })
        ),
        title: stringArg(),
        courseId: stringArg(),
      },
      async resolve(_parent, args, ctx) {
        if (!ctx.user) return null;

        const classroomExists = await ctx.prisma.classroom.count({
          where: {
            id: args.classroomId,
            teachers: {
              some: {
                email: ctx.user.email ?? null,
              },
            },
          },
        });
        if (classroomExists === 0) return null;

        const data: Partial<PrismaClassroom> = {};
        if (args.title) data.title = args.title;
        if (args.courseId) data.courseId = args.courseId;

        return ctx.prisma.classroom.update({
          where: {
            id: args.classroomId,
          },
          data,
        });
      },
    });
  },
});
