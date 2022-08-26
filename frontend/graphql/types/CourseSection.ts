import type { CourseSection as PrismaCourseSection } from "@prisma/client";
import getUserGQL from "helpers/getUserGQL";
import isCourseOwner from "helpers/isCourseOwner";
import isCourseSectionOwner from "helpers/isCourseSectionOwner";
import slugifyText from "helpers/slugifyText";
import { extendType, list, nonNull, objectType, stringArg } from "nexus";

const CourseSection = objectType({
  name: "CourseSection",
  definition(t) {
    t.string("id");
    t.string("title");
    t.string("slug");
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

        const courseSection = await ctx.prisma.courseSection.create({
          data: {
            title: args.title,
            courseId: args.courseId,
            slug: slugifyText(args.title),
          },
        });

        const subSectionTitle = "Default";
        await ctx.prisma.subSection.create({
          data: {
            title: subSectionTitle,
            courseSectionId: courseSection.id,
            slug: slugifyText(subSectionTitle),
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
        if (args.title != null) {
          data.title = args.title;
          data.slug = slugifyText(args.title);
        }

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
  },
});

export default CourseSection;
