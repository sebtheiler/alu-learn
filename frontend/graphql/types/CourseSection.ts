import type { CourseSection as PrismaCourseSection } from "@prisma/client";
import getUserGQL from "helpers/getUserGQL";
import isCourseOwner from "helpers/isCourseOwner";
import isCourseSectionOwner from "helpers/isCourseSectionOwner";
import moveObject from "helpers/moveObject";
import slugifyText from "helpers/slugifyText";
import {
  extendType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

const CourseSection = objectType({
  name: "CourseSection",
  definition(t) {
    t.string("id");
    t.string("title");
    t.string("slug");
    t.string("description");
    t.string("color");
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
        if (!user || !isCourseOwner(args.courseId, ctx.user?.email, ctx.prisma))
          return null;

        const newIndex = await ctx.prisma.courseSection.count({
          where: {
            courseId: args.courseId,
          },
        });

        const courseSection = await ctx.prisma.courseSection.create({
          data: {
            title: args.title,
            courseId: args.courseId,
            slug: slugifyText(args.title),
            index: newIndex,
          },
        });

        const subSectionTitle = "Default";
        await ctx.prisma.subSection.create({
          data: {
            title: subSectionTitle,
            courseSectionId: courseSection.id,
            slug: slugifyText(subSectionTitle),
            index: 0,
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
        color: stringArg(),
        description: stringArg(),
        courseSectionId: nonNull(
          stringArg({ description: "ID of the course section to update" })
        ),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (
          !user ||
          !isCourseSectionOwner(
            args.courseSectionId,
            ctx.user?.email,
            ctx.prisma
          )
        )
          return null;

        const data: Partial<PrismaCourseSection> = {};
        if (args.title) {
          data.title = args.title;
          data.slug = slugifyText(args.title);
        }
        if (args.color) data.color = args.color;
        if (typeof args.description === "string")
          data.description = args.description;

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
        if (
          !user ||
          !isCourseSectionOwner(
            args.courseSectionId,
            ctx.user?.email,
            ctx.prisma
          )
        )
          return null;

        return ctx.prisma.courseSection.delete({
          where: { id: args.courseSectionId },
        });
      },
    });
    t.field("moveCourseSection", {
      type: "CourseSection",
      description: "Moves a course section from a position to another",
      args: {
        courseId: nonNull(stringArg()),
        from: nonNull(intArg()),
        to: nonNull(intArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user || !isCourseOwner(args.courseId, ctx.user?.email))
          return null;

        return moveObject({
          objType: "COURSE_SECTION",
          from: args.from,
          to: args.to,
          parentQuery: { courseId: args.courseId },
          objQuery: {
            courseId: args.courseId,
          },
          ctx,
        });
      },
    });
  },
});

export default CourseSection;
