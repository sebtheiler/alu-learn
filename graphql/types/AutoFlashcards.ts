import { ApolloError } from "apollo-server-micro";
// import getUserGQL from "helpers/getUserGQL";
import openai from "lib/openai";
import { extendType, nonNull, stringArg } from "nexus";

export const AutoFlashcardsMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.list.field("generateAutoFlashcard", {
      type: "String",
      description:
        'Generates a flashcard automatically from some source text. Returns ["front", "back"]',
      args: {
        sourceText: nonNull(stringArg()),
      },
      async resolve(_parent, args) {
        // TODO: throttle users by usage with a cap of 250/mo

        if (args.sourceText.length > 250)
          throw new ApolloError("Source text too long");

        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `Text: If ecosystems had an infinite amount of resources, populations would grow exponentially however we do not see this occur because of carrying capacity. A carrying capacity is the maximum population size of the species that the environment can sustain, given the food, habitat, water, sunlight  and other necessities available in the environment.\nFront: Carrying Capacity\nBack: The maximum population size of the species that the environment can sustain, given the food, habitat, water, sunlight and other necessities available in the environment. \n\n---\n\nText:${args.sourceText}\nFront:`,
          temperature: 0.5,
          max_tokens: 64,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        });

        const rawText = response.data.choices[0].text;
        if (!rawText) throw new ApolloError("Failed to generate");
        const split = rawText?.split("\n");
        if (split?.length !== 2) throw new ApolloError("Failed to generate");
        const front = split[0].trim();
        const back = split[1].replace("Back: ", "");

        return [front, back];
      },
    });
  },
});
