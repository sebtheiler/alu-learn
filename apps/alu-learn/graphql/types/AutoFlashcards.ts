import { createCourse } from "./Course";
import formatPlural from "helpers-lib/src/formatPlural";
import capitalize from "helpers-lib/src/capitalize";
import { JSONData } from "./scalars";
import {
  AUTO_FLASHCARD_LIMITS,
  languageToPrompt,
  SOURCE_TEXT_MAX_LENS,
  TWO_SIDED_FLASHCARDS,
} from "@/globals";
import { generateLexicalElement } from "lexical-editor/src/helpers/blankLexicalElement";
import type {
  Course,
  CourseSection,
  GeneratedFlashcard,
  SubSection,
} from "@/types";
import type { Flashcard as PrismaFlashcard, User } from "@prisma/client";
import { ApolloError } from "@apollo/client";
import createCompletion from "helpers/createCompletion";
import getUserGQL from "helpers/getUserGQL";
import {
  arg,
  enumType,
  extendType,
  intArg,
  list,
  nonNull,
  stringArg,
} from "nexus";
import createChatGPTCompletion from "helpers/createChatGPTCompletion";
import { Context } from "graphql/context";
import fixJson from "helpers/fixJson";

const aiTokenCostAmount = {
  autocompleteFlashcard: 1,
  autoGradeEssay: 10,
  autoFeedbackEssay: 10,
};

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
        language: nonNull(arg({ type: LanguageSelectionType })),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          isPro: true,
          numAutoFlashcardsGenerated: true,
        });
        if (!user?.id) return null;

        checkAutoFlashcardsGeneratedQuota(user);

        let flashcards: GeneratedFlashcard[] = [];

        switch (args.mode) {
          case "CLOZE": {
            if (args.sourceText.length > SOURCE_TEXT_MAX_LENS["CLOZE"])
              throw new ApolloError({ errorMessage: "Source text too long" });

            const { rawText } = await createCompletion(
              `Input: When the resource base of a population shrinks, the increased potential for unequal distribution of resources will ultimately result in increased mortality, decreased fecundity, or both, resulting in population growth declining to, or below, carrying capacity.\nOutput: When the {{resource base}} of a population shrinks, the increased potential for {{unequal distribution}} of resources will ultimately result in {{increased mortality}}, {{decreased fecundity}}, or both, resulting in population growth declining to, or below, carrying capacity.\n\nInput: Portuguese development of maritime technology and navigational skills led to increased travel to and trade with Africa and Asia and resulted in the construction of a global trading-post empire.\nOutput: Portuguese development of {{maritime technology and navigational skills}} led to increased travel to and trade with Africa and Asia and resulted in the construction of a {{global trading-post empire}}.\n\nInput: A major ecological effect of population overshoot is dieback of the population (often severe to catastrophic) because the lack of available resources leads to famine, disease, and/or conflict.\nOutput: A major ecological effect of {{population overshoot}} is dieback of the population (often severe to catastrophic) because the lack of available resources leads to {{famine}}, {{disease}}, and/or {{conflict}}.\n\nInput:${args.sourceText.replace(
                "\n",
                " "
              )}\nOutput:`
            );

            const split = rawText?.split("\n");
            if (split?.length !== 1)
              throw new ApolloError({ errorMessage: "Failed to generate" });
            const output = split[0].trim();

            flashcards = [{ front: output, back: "", flashcardType: "CLOZE" }];
            break;
          }
          case "NOTES": {
            if (args.sourceText.length > SOURCE_TEXT_MAX_LENS["NOTES"])
              throw new ApolloError({ errorMessage: "Source text too long" });

            const processedSource = args.sourceText.split("\n\n");

            const MAX_LEN_BUFFER = 1000;
            const TARGET_LEN = 800;

            const process = async (text: string) => {
              const numFlashcards = Math.ceil(text.length / 100); // heuristic (233 characters -> 3 flashcards)
              const generatedFlashcards = await generateFlashcards(
                text.slice(0, MAX_LEN_BUFFER),
                numFlashcards,
                args.language
              );
              flashcards = flashcards.concat(generatedFlashcards);
            };

            // Stop generating flashcards after the max has been exceeded
            const shouldBreak = () => false;

            for (const segment of processedSource) {
              if (shouldBreak()) break;
              if (segment.length < MAX_LEN_BUFFER) {
                await process(segment);
                continue;
              }

              const split = segment.split("\n");
              let aggregatedText = "";
              for (let i = 0; i < split.length; i++) {
                if (shouldBreak()) break;
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
          case "CHATGPT": {
            if (args.sourceText.length > SOURCE_TEXT_MAX_LENS["NOTES"])
              throw new ApolloError({ errorMessage: "Source text too long" });

            const jsonFormat =
              '[{"front": "What is (important vocabulary term)?", "back": "(definition of vocab)"}, ...]';
            const [completion] = await createChatGPTCompletion({
              systemPrompt: `You are a professional flashcard creator that creates flashcards from notes. I will give you my notes, and you will create high-quality flashcards on the essential vocabulary from the notes. Your flashcards are concise yet contain all necessary details and reasoning, and you prefer to create multiple short flashcards over one long flashcard; optionally include additional information in parentheses at the bottom. Create as many flashcards as necessary.\n\nCreate the flashcards in JSON format:\n${jsonFormat}`,
              prompt: args.sourceText,
              maxTokens: 1024,
              saveData: { ctx, userId: user.id },
            });

            const generatedFlashcards: { front: string; back: string }[] =
              await fixJson(completion, jsonFormat);

            flashcards = generatedFlashcards.map((f) => ({
              front: f.front,
              back: f.back.endsWith(".") ? f.back.slice(0, -1) : f.back,
              flashcardType: "NORMAL",
            }));

            break;
          }
          default:
            throw new ApolloError({ errorMessage: "Invalid `mode`" });
        }

        incrementAutoFlashcardsGenerated(
          ctx,
          user.id,
          Math.max(flashcards.length, 1)
        );

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
          throw new ApolloError({
            errorMessage:
              "Couldn't find sub section, course section, and course",
          });

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
    t.field("autocompleteFlashcard", {
      type: "String",
      description:
        "Automatically completes the back of a flashcard given its front",
      args: {
        front: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          isPro: true,
          numAutoFlashcardsGenerated: true,
        });
        if (!user?.id) return null;

        checkAutoFlashcardsGeneratedQuota(user);
        incrementAutoFlashcardsGenerated(
          ctx,
          user.id,
          aiTokenCostAmount.autocompleteFlashcard
        );

        const [completion] = await createChatGPTCompletion({
          systemPrompt:
            "You are a flashcard creator. I will give you the front of a flashcard and you will create its back. Be short and concise in your response; optionally include extra details in parentheses at the bottom. Return nothing but the back of the flashcard.",
          prompt: args.front.trim(),
          maxTokens: 256,
          saveData: { ctx, userId: user.id },
        });

        return completion.trim();
      },
    });
    t.field("autoGradeEssay", {
      type: "String",
      description: "Uses AI to automatically grade an essay",
      args: {
        prompt: nonNull(stringArg()),
        rubric: nonNull(stringArg()),
        essay: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          isPro: true,
          numAutoFlashcardsGenerated: true,
        });
        if (!user?.id) return null;

        checkAutoFlashcardsGeneratedQuota(user);
        incrementAutoFlashcardsGenerated(
          ctx,
          user.id,
          aiTokenCostAmount.autoGradeEssay
        );

        const jsonFormat = `
 [{"category": "${JSON.parse(args.rubric)
   .rows[0].title.toLowerCase()
   .trim()}", "justification": "...", "score": "..."}, {"category": "...", ...}, ...]
`.trim();

        const systemPrompt = `
You are a high school teacher grading students' responses according to a rubric. Grade accurately but be strict to the rubric; provide concise justification, and score the number of points the student should receive. Cite specific evidence from the student's response and the rubric in your justification. Address the student as "you".

Prompt: ${args.prompt.trim()}

Rubric:
${getRubricInfoStr(args.rubric)}

Respond in JSON format: ${jsonFormat}

`.trim();
        const [completion] = await createChatGPTCompletion({
          systemPrompt,
          prompt: args.essay.trim(),
          maxTokens: 1024,
          saveData: { ctx, userId: user.id },
        });

        const fixedCompletion = await fixJson(completion, jsonFormat);

        return JSON.stringify(fixedCompletion).trim();
      },
    });
    t.field("autoEssayFeedback", {
      type: "String",
      description: "Uses AI to automatically provide feedback on an essay",
      args: {
        prompt: nonNull(stringArg()),
        rubric: nonNull(stringArg()),
        essay: nonNull(stringArg()),
        grades: nonNull(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        const user = await getUserGQL(ctx, {
          id: true,
          isPro: true,
          numAutoFlashcardsGenerated: true,
        });
        if (!user?.id) return null;

        checkAutoFlashcardsGeneratedQuota(user);
        incrementAutoFlashcardsGenerated(
          ctx,
          user.id,
          aiTokenCostAmount.autoFeedbackEssay
        );

        const systemPrompt = `
You are a high school tutor helping students improve their essays. Cite evidence from the rubric and the student's essay to help them improve. List specific points and concrete examples they can work on to improve their essay. Prioritize categories the student is struggling the most with. Address the student as "you" and be kind and positive; start the conversation with a greeting. Respond in detailed bullet points. Ask questions to push the student's thinking

Prompt: ${args.prompt.trim()}

Rubric:
${getRubricInfoStr(args.rubric)}
`.trim();
        const gradedEssay = `
${args.essay}

Grade:
${JSON.parse(args.grades)
  .map(
    (grade) =>
      `${capitalize(grade.category.trim())} - ${grade.score}/${
        JSON.parse(args.rubric).rows.find(
          (r) => r.title.toLowerCase() === grade.category.toLowerCase().trim()
        )?.cols.length
      }`
  )
  .join("\n")}
`.trim();
        const [completion] = await createChatGPTCompletion({
          systemPrompt,
          prompt: gradedEssay,
          maxTokens: 1024,
          saveData: { ctx, userId: user.id },
        });

        return completion.trim();
      },
    });
  },
});

const generateFlashcards = async (
  sourceText: string,
  numFlashcards: number,
  language: keyof typeof languageToPrompt = "ENGLISH"
): Promise<GeneratedFlashcard[]> => {
  // Put together the prompt using the "fragments" for the given language
  const { mainPrompt, front, whatWord } = languageToPrompt[language];
  const prompt =
    `${mainPrompt}\n\n${sourceText}\n\n${front}${whatWord}`.replace(
      "<NUM>",
      ((numFlashcards ?? 3) + 1).toString()
    );
  const { rawText } = await createCompletion(prompt, 256);
  const split = `${front}${whatWord}${rawText}`.split("\n");

  const flashcards: GeneratedFlashcard[] = [];
  for (let i = 0; i < split.length - 1; i++) {
    const line = split[i];
    const nextLine = split[i + 1];
    const FRONT = languageToPrompt[language].front;
    const BACK = languageToPrompt[language].back;
    if (line.startsWith(FRONT)) {
      if (nextLine.startsWith(BACK)) {
        // Works with this format:
        // 0: Front: abc
        // 1: Back: xyz
        flashcards.push({
          front: line.replace(FRONT, "").trim(),
          back: nextLine.replace(BACK, "").trim(),
          flashcardType: "NORMAL",
        });
      } else if (line === FRONT) {
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

/**
 * @param rubric JSON stringified rubric
 * Returns in this format:
 * Thesis:
 * 2 Points: ...
 * 1 Point: ...
 */
const getRubricInfoStr = (rubric: string) =>
  JSON.parse(rubric)
    .rows.map((row) =>
      `
${row.title.trim()}:
${row.cols
  .map(
    (col, i) =>
      `${formatPlural(row.cols.length - i, "Point")}: ${col.description.trim()}`
  )
  .join("\n")}
`.trim()
    )
    .join("\n\n");

/**
 * Check if a `user` is above the quota for AI credit use
 */
const checkAutoFlashcardsGeneratedQuota = (user: Partial<User>) => {
  const MAX_NUM_FLASHCARDS = user.isPro
    ? AUTO_FLASHCARD_LIMITS.pro
    : AUTO_FLASHCARD_LIMITS.regular;
  const numAutoFlashcardsGenerated = user.numAutoFlashcardsGenerated ?? 0;
  if (numAutoFlashcardsGenerated >= MAX_NUM_FLASHCARDS)
    throw new Error("Above flashcard generation quota");
};
/**
 * Increment the number of AI credits that a user has used this month
 */
const incrementAutoFlashcardsGenerated = async (
  ctx: Context,
  userId: string,
  by: number
) => {
  await ctx.prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      numAutoFlashcardsGenerated: {
        increment: by,
      },
    },
  });
};

export const LanguageSelectionType = enumType({
  name: "LanguageSelectionType",
  members: Object.keys(languageToPrompt),
});

export const AutoFlashcardsMode = enumType({
  name: "AutoFlashcardsMode",
  members: ["CLOZE", "NOTES", "CHATGPT"],
});
