import { extendType, list, nonNull, objectType, stringArg } from "nexus";

const Assignment = objectType({
  name: "Assignment",
  definition(t) {
    t.string("id");
    t.string("title");
  },
});

export default Assignment;

export const AssignmentsMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createAssignment", {
      type: Assignment,
      description: "Creates an assignment",
      args: {
        title: nonNull(stringArg()),
        subSectionIds: nonNull(
          list(
            nonNull(
              stringArg({ description: "IDs of the subsections to assign" })
            )
          )
        ),
        classroomIds: nonNull(
          list(
            nonNull(
              stringArg({ description: "IDs of the classrooms to post to" })
            )
          )
        ),
      },
      async resolve(_parent, args, ctx) {
        if (!ctx.user) return null;

        return ctx.prisma.assignment.create({
          data: {
            title: args.title,
            classrooms: {
              connect: args.classroomIds.map((id) => ({ id })),
            },
            assignedSubSections: {
              connect: args.subSectionIds.map((id) => ({ id })),
            },
          },
        });
      },
    });
  },
});
