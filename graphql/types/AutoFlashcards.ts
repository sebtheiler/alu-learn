import { JSONData } from "./scalars";
import type { GeneratedFlashcard } from "@/types";
import { ApolloError } from "apollo-server-micro";
// import getUserGQL from "helpers/getUserGQL";
import openai from "lib/openai";
import { enumType, extendType, intArg, nonNull, stringArg } from "nexus";

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
      async resolve(_parent, args) {
        // TODO: throttle users by usage with a cap of 250/mo

        switch (args.mode) {
          case "SINGLE": {
            if (args.sourceText.length > 250)
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

            return [{ front, back, flashcardType: "NORMAL" }];
          }
          case "MULTI": {
            if (args.sourceText.length > 1000)
              throw new ApolloError("Source text too long");

            // Remove single enter lines, but keep doubles
            const DOUBLE_RETURN = "<DOUBLE RETURN>";
            const processedSource = args.sourceText
              .replaceAll("\n\n", DOUBLE_RETURN)
              .replaceAll("\n", " ")
              .replaceAll(DOUBLE_RETURN, "\n");
            

            const { rawText } = await createCompletion(
              // `Make flashcards from my notes:\n\n${processedSource}\n\nFront:`,
              // `Make front and back flashcards from my notes:\n\n${processedSource}\n\nFront:`,
              `Make ${
                NUMBER_TO_WORD[(args.numFlashcards ?? 3) + 1] // not sure why this needs to be incremented by one
              } flashcards from my notes:\n\n${processedSource}\n\nFront: Wh`,
              // `Front: What is the demographic transition?\nBack: The demographic transition refers to the transition from high to lower birth and death rates in a country or region as development occurs and that country moves from a preindustrial to an industrialized economic system. This transition is typically demonstrated through a four-stage demographic transition model (DTM).\n\nMake flashcards from my notes:\n\n${processedSource}\n\nFront:`,
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
          }
          case "CLOZE": {
            if (args.sourceText.length > 200)
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

            return [{ front: output, back: "", flashcardType: "CLOZE" }];
          }
          case "NOTES":
            return [];
          default:
            throw new ApolloError("Invalid `mode`");
        }
      },
    });
  },
});

export const AutoFlashcardsMode = enumType({
  name: "AutoFlashcardsMode",
  members: ["SINGLE", "MULTI", "CLOZE", "NOTES"],
});

const createCompletion = async (prompt: string, maxTokens = 64) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0.5,
    max_tokens: maxTokens,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const rawText = response.data.choices[0].text;
  if (!rawText) throw new ApolloError("Failed to generate");

  return { rawText };
};

const NUMBER_TO_WORD = {
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
};
