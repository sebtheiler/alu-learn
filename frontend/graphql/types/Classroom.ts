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
  },
});
