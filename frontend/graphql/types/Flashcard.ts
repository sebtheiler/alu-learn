import getUserGQL from "../../lib/getUserGQL";
import isSubSectionOwner from "./helpers/isSubSectionOwner";
import { JSONData } from "./scalars";
import {
  arg,
  enumType,
  extendType,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

const Flashcard = objectType({
  name: "Flashcard",
  definition(t) {
    t.string("id");
    t.field("fields", { type: JSONData });
    t.string("tags");
    t.field("type", { type: FlashcardType });
  },
});

export const FlashcardMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createFlashcard", {
      type: Flashcard,
      description: "Creeates a new flashcard",
      args: {
        fields: nonNull(arg({ type: JSONData })),
        tags: stringArg(),
        flashcardType: arg({ type: FlashcardType }),
        courseSectionSlug: nonNull(stringArg()),
        subSectionSlug: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx);
        if (!user) return null;

        // TODO: use slugs
        // const subSection = ctx.prisma.subSection.findUnique({
        //   where: {

        //   }
        // })
        const subSection = await ctx.prisma.subSection.findFirst();
        if (!subSection || !isSubSectionOwner(subSection.id, ctx)) return null;

        return ctx.prisma.flashcard.create({
          data: {
            fields: args.fields,
            tags: args.tags ?? "",
            subSection: {
              connect: {
                id: subSection.id,
              },
            },
          },
        });
      },
    });
  },
});

export default Flashcard;

export const FlashcardType = enumType({
  name: "FlashcardType",
  members: ["NORMAL", "CLOZE"],
});
