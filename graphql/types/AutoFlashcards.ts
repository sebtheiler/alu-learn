import { createCourse } from "./Course";
import { JSONData } from "./scalars";
import {
  AUTO_FLASHCARD_LIMITS,
  DOUBLE_RETURN,
  NUMBER_TO_WORD,
  SOURCE_TEXT_MAX_LENS,
  TWO_SIDED_FLASHCARDS,
} from "@/globals";
import { generateLexicalElement } from "@/helpers/blankLexicalElement";
import type {
  Course,
  CourseSection,
  GeneratedFlashcard,
  SubSection,
} from "@/types";
import type { Flashcard as PrismaFlashcard } from "@prisma/client";
import { ApolloError } from "apollo-server-micro";
import createCompletion from "helpers/createCompletion";
import getUserGQL from "helpers/getUserGQL";
import { enumType, extendType, intArg, list, nonNull, stringArg } from "nexus";

export const AutoFlashcardsMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.list.field("generateAutoFlashcard", {
      type: JSONData,
      description:
        'Generates a flashcard automatically from some source text. Returns ["front", "back"]',
      args: {
        sourceText: nonNull(stringArg()),
        mode: nonNull(AutoFlashcardsMode),
        numFlashcards: intArg({ description: "Number of flashcards" }),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          isPro: true,
          numAutoFlashcardsGenerated: true,
        });
        if (!user) return null;

        const MAX_NUM_FLASHCARDS = user.isPro
          ? AUTO_FLASHCARD_LIMITS.pro
          : AUTO_FLASHCARD_LIMITS.regular;
        if ((user.numAutoFlashcardsGenerated ?? 0) >= MAX_NUM_FLASHCARDS)
          throw new Error("Above flashcard generation quota");

        let flashcards: GeneratedFlashcard[] = [];

        switch (args.mode) {
          case "SINGLE": {
            if (args.sourceText.length > SOURCE_TEXT_MAX_LENS["SINGLE"])
              throw new ApolloError("Source text too long");

            const { rawText } = await createCompletion(
              `Text: If ecosystems had an infinite amount of resources, populations would grow exponentially however we do not see this occur because of carrying capacity. A carrying capacity is the maximum population size of the species that the environment can sustain, given the food, habitat, water, sunlight  and other necessities available in the environment.\nFront: Carrying Capacity\nBack: The maximum population size of the species that the environment can sustain, given the food, habitat, water, sunlight and other necessities available in the environment. \n\n---\n\nText:${args.sourceText.replace(
                "\n",
                " "
              )}\nFront:`
            );

            const split = rawText?.split("\n");
            if (split?.length !== 2)
              throw new ApolloError("Failed to generate");
            const front = split[0].trim();
            const back = split[1].replace("Back: ", "");

            flashcards = [{ front, back, flashcardType: "NORMAL" }];
            break;
          }
          case "MULTI": {
            if (args.sourceText.length > SOURCE_TEXT_MAX_LENS["MULTI"])
              throw new ApolloError("Source text too long");

            // Remove single enter lines, but keep doubles
            const processedSource = args.sourceText
              .replaceAll("\n\n", DOUBLE_RETURN)
              .replaceAll("\n", " ")
              .replaceAll(DOUBLE_RETURN, "\n");

            flashcards = await generateFlashcards(
              processedSource,
              args.numFlashcards ?? 3
            );

            break;
          }
          case "CLOZE": {
            if (args.sourceText.length > SOURCE_TEXT_MAX_LENS["CLOZE"])
              throw new ApolloError("Source text too long");

            const { rawText } = await createCompletion(
              `Input: When the resource base of a population shrinks, the increased potential for unequal distribution of resources will ultimately result in increased mortality, decreased fecundity, or both, resulting in population growth declining to, or below, carrying capacity.\nOutput: When the {{resource base}} of a population shrinks, the increased potential for {{unequal distribution}} of resources will ultimately result in {{increased mortality}}, {{decreased fecundity}}, or both, resulting in population growth declining to, or below, carrying capacity.\n\nInput: Portuguese development of maritime technology and navigational skills led to increased travel to and trade with Africa and Asia and resulted in the construction of a global trading-post empire.\nOutput: Portuguese development of {{maritime technology and navigational skills}} led to increased travel to and trade with Africa and Asia and resulted in the construction of a {{global trading-post empire}}.\n\nInput: A major ecological effect of population overshoot is dieback of the population (often severe to catastrophic) because the lack of available resources leads to famine, disease, and/or conflict.\nOutput: A major ecological effect of {{population overshoot}} is dieback of the population (often severe to catastrophic) because the lack of available resources leads to {{famine}}, {{disease}}, and/or {{conflict}}.\n\nInput:${args.sourceText.replace(
                "\n",
                " "
              )}\nOutput:`
            );

            const split = rawText?.split("\n");
            if (split?.length !== 1)
              throw new ApolloError("Failed to generate");
            const output = split[0].trim();

            flashcards = [{ front: output, back: "", flashcardType: "CLOZE" }];
            break;
          }
          case "NOTES": {
            if (args.sourceText.length > SOURCE_TEXT_MAX_LENS["NOTES"])
              throw new ApolloError("Source text too long");

            const processedSource = args.sourceText.split("\n\n");

            const MAX_LEN_BUFFER = 1000;
            const TARGET_LEN = 800;

            const process = async (text: string) => {
              const numFlashcards = Math.ceil(text.length / 100); // heuristic (233 characters -> 3 flashcards)
              const generatedFlashcards = await generateFlashcards(
                text.slice(0, MAX_LEN_BUFFER),
                numFlashcards
              );
              flashcards = flashcards.concat(generatedFlashcards);
            };

            for (const segment of processedSource) {
              if (flashcards.length > MAX_NUM_FLASHCARDS) break;
              if (segment.length < MAX_LEN_BUFFER) {
                await process(segment);
                continue;
              }

              const split = segment.split("\n");
              let aggregatedText = "";
              for (let i = 0; i < split.length; i++) {
                if (flashcards.length > MAX_NUM_FLASHCARDS) break;
                if (
                  aggregatedText.length > TARGET_LEN || // if we're above the target length
                  aggregatedText.length + split[i].length > MAX_LEN_BUFFER || // if the next line would put us above the max length
                  i === split.length - 1 // if we're at the final line
                ) {
                  await process(aggregatedText);
                  aggregatedText = "";
                }

                aggregatedText += " " + split[i];
              }
            }

            break;
          }
          default:
            throw new ApolloError("Invalid `mode`");
        }

        // Increment the number of automatic flashcards the user has generated this month
        await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            numAutoFlashcardsGenerated: {
              increment: Math.max(flashcards.length, 1),
            },
          },
        });

        // Save the generation in the database
        await ctx.prisma.autoFlashcardsGeneration.create({
          data: {
            userId: user.id,
            inputText: args.sourceText,
            generatedOutput: JSON.stringify(flashcards),
          },
        });

        return flashcards;
      },
    });
    t.field("saveGeneratedFlashcards", {
      type: "String",
      description:
        "Saves generated flashcards. Must specify course title or sub section id, but not both",
      args: {
        generatedFlashcards: nonNull(list(JSONData)),
        courseTitle: stringArg(),
        subSectionId: stringArg(),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, { id: true });
        if (!user) return null;

        let subSection: SubSection | undefined;
        let courseSection: CourseSection | undefined;
        let course: Course | undefined;

        if (args.courseTitle) {
          const {
            course: newCourse,
            courseSection: newCourseSection,
            subSection: newSubSection,
          } = await createCourse(
            args.courseTitle,
            user.id as string,
            ctx.prisma
          );
          subSection = newSubSection;
          courseSection = newCourseSection;
          course = newCourse as Course;
        } else if (args.subSectionId) {
          subSection = await ctx.prisma.subSection.findUniqueOrThrow({
            where: { id: args.subSectionId },
            select: {
              slug: true,
              id: true,
              courseSection: {
                select: { slug: true, course: { select: { id: true } } },
              },
            },
          });
          // @ts-ignore
          courseSection = subSection.courseSection;
          // @ts-ignore
          course = courseSection.course;
        }
        if (!(subSection && courseSection && course))
          throw new ApolloError(
            "Couldn't find sub section, course section, and course"
          );

        const startingIndex = await ctx.prisma.flashcard.count({
          where: { subSectionId: subSection.id as string },
        });
        const flashcards: Partial<PrismaFlashcard>[] = [];

        for (const [i, generatedFlashcard] of (
          args.generatedFlashcards as GeneratedFlashcard[]
        ).entries()) {
          let fields: string;
          if (TWO_SIDED_FLASHCARDS.includes(generatedFlashcard.flashcardType)) {
            fields = JSON.stringify([
              generateLexicalElement(generatedFlashcard.front),
              generateLexicalElement(generatedFlashcard.back),
            ]);
          } else {
            fields = JSON.stringify([
              generateLexicalElement(generatedFlashcard.front),
            ]);
          }

          flashcards.push({
            fields,
            tags: "",
            index: startingIndex + i,
            type: generatedFlashcard.flashcardType,
            subSectionId: subSection.id as string,
            courseId: course.id as string,
          });
        }

        await ctx.prisma.flashcard.createMany({
          data: flashcards as PrismaFlashcard[],
        });

        return `/course/${course.id}/flashcards/${courseSection.slug}/${subSection.slug}`;
      },
    });
  },
});

export const AutoFlashcardsMode = enumType({
  name: "AutoFlashcardsMode",
  members: ["SINGLE", "MULTI", "CLOZE", "NOTES"],
});

const generateFlashcards = async (
  sourceText: string,
  numFlashcards: number
): Promise<GeneratedFlashcard[]> => {
  const { rawText } = await createCompletion(
    `Make ${
      NUMBER_TO_WORD[(numFlashcards ?? 3) + 1] // not sure why this needs to be incremented by one
    } flashcards from my notes:\n\n${sourceText}\n\nFront: Wh`,
    256
  );
  const split = `Front Wh:${rawText}`.split("\n");

  const flashcards: GeneratedFlashcard[] = [];
  for (let i = 0; i < split.length - 1; i++) {
    const line = split[i];
    const nextLine = split[i + 1];
    if (line.startsWith("Front:")) {
      if (nextLine.startsWith("Back:")) {
        // Works with this format:
        // 0: Front: abc
        // 1: Back: xyz
        flashcards.push({
          front: line.replace("Front: ", "").trim(),
          back: nextLine.replace("Back: ", "").trim(),
          flashcardType: "NORMAL",
        });
      } else if (line === "Front:") {
        // Works with this format:
        // 0: Front:
        // 1: abc
        // 2: Back:
        // 3: xyz
        flashcards.push({
          front: nextLine.trim(),
          back: split[i + 3].trim(),
          flashcardType: "NORMAL",
        });
      }
    }
  }

  return flashcards;
};
