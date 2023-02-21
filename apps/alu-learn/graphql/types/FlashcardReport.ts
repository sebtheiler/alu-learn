import sendEmail from "emails/sendEmail";
import getUserGQL from "helpers/getUserGQL";
import { objectType, extendType, nonNull, stringArg } from "nexus";

const FlashcardReport = objectType({
  name: "FlashcardReport",
  definition(t) {
    t.string("id");
    t.string("flashcardId");
    t.string("userId");
    t.string("reasons");
    t.string("timestamp");
  },
});

export default FlashcardReport;

export const FlashcardReportMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createFlashcardReport", {
      type: FlashcardReport,
      description: "Creates a new flashcard report",
      args: {
        reasons: nonNull(stringArg()),
        flashcardId: nonNull(stringArg()),
      },
      async resolve(_root, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          name: true,
          username: true,
        });
        if (!user) return null;

        // Get reported flashcard
        const flashcard = await ctx.prisma.flashcard.findUniqueOrThrow({
          where: { id: args.flashcardId },
          select: { fields: true, courseId: true },
        });

        // Get the owners of the course that the flashcard is in
        const course = await ctx.prisma.course.findUniqueOrThrow({
          where: { id: flashcard.courseId },
          select: {
            id: true,
            title: true,
            owners: { select: { email: true } },
          },
        });

        // Send email to course owners
        sendEmail({
          to: course.owners.map((owner) => owner.email as string),
          subject: `Flashcard Report in ${course.title}`,
          text: `New report on flashcard "${flashcard.fields}" (${args.flashcardId}) in ${course.title} by ${user.name} (${user.username}). Reasons: ${args.reasons}`,
        });

        return ctx.prisma.flashcardReport.create({
          data: {
            reasons: args.reasons,
            flashcard: {
              connect: {
                id: args.flashcardId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
          },
          select: {
            id: true,
          },
        });
      },
    });
  },
});
