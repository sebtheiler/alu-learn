import { ApolloError } from "apollo-server-micro";
import isCourseUser from "helpers/isCourseUser";
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

        const { courseId } = await ctx.prisma.classroom.findFirstOrThrow({
          where: {
            id: args.classroomIds[0],
          },
          select: {
            courseId: true,
          },
        });

        if (!isCourseUser(courseId as string, ctx.user.email, ctx.prisma))
          return null;

        // Assert that the user is a teacher of all the classrooms
        const classroomsTaught = await ctx.prisma.classroom.count({
          where: {
            id: {
              in: args.classroomIds,
            },
            courseId,
          },
        });
        if (classroomsTaught !== args.classroomIds.length)
          throw new ApolloError(
            "You must be a teacher of all the specified classrooms and all specified classrooms must have the same course"
          );

        // Assert that all the subsections belong to the same course
        const subSectionsToCourse = await ctx.prisma.subSection.count({
          where: {
            courseSection: {
              courseId: courseId as string,
            },
          },
        });
        if (subSectionsToCourse !== args.subSectionIds.length)
          throw new ApolloError(
            "All sub sections must belong to the same course"
          );

        // Create assignment
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
