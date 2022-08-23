import getUserGQL from "../../lib/getUserGQL";
import isCourseOwner from "./helpers/isCourseOwner";
import isCourseSectionOwner from "./helpers/isCourseSectionOwner";
import { extendType, list, nonNull, objectType, stringArg } from "nexus";
import type { NonNullableKeys } from "types";

const CourseSection = objectType({
  name: "CourseSection",
  definition(t) {
    t.string("id");
    t.string("title");
    t.field("subSections", {
      type: list("SubSection"),
      resolve(courseSection, _args, ctx) {
        return ctx.prisma.subSection.findMany({
          where: {
            courseSectionId: courseSection.id ?? "",
          },
        });
      },
    });
  },
});

export const CourseSectionMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createCourseSection", {
      type: CourseSection,
      description:
        "Creates a new course section and populates it with a default subsection",
      args: {
        title: nonNull(stringArg()),
        courseId: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseOwner(args.courseId, ctx)) return null;

        const courseSection = await ctx.prisma.courseSection.create({
          data: {
            title: args.title as string,
            courseId: args.courseId as string,
          },
        });

        await ctx.prisma.subSection.create({
          data: {
            title: "Default",
            courseSectionId: courseSection.id,
          },
        });

        return courseSection;
      },
    });
    t.field("updateCourseSection", {
      type: "CourseSection",
      description: "Change a course section's settings",
      args: {
        title: stringArg(),
        courseSectionId: nonNull(
          stringArg({ description: "ID of the course section to update" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseSectionOwner(args.courseSectionId, ctx))
          return null;

        const data: Partial<NonNullableKeys<typeof args>> = {};
        if (args.title != null) data.title = args.title;

        return ctx.prisma.courseSection.update({
          where: { id: args.courseSectionId },
          data: data,
        });
      },
    });
    t.field("deleteCourseSection", {
      type: "CourseSection",
      description: "Deletes a course section",
      args: {
        courseSectionId: nonNull(
          stringArg({ description: "ID of the course section to delete" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseSectionOwner(args.courseSectionId, ctx))
          return null;

        return ctx.prisma.courseSection.delete({
          where: { id: args.courseSectionId },
        });
      },
    });
  },
});

export default CourseSection;
