import { ApolloError } from "@apollo/client";
import type { AutoFlashcardsGeneration } from "@prisma/client";
import type { Context } from "graphql/context";
import openai from "lib/openai";

const createChatGPTCompletion = async ({
  systemPrompt,
  prompt,
  maxTokens = 128,
  saveData: { ctx, userId },
}: {
  systemPrompt: string;
  prompt: string;
  maxTokens?: number;
  saveData: {
    ctx: Context;
    userId: string;
  };
}): Promise<[string, AutoFlashcardsGeneration]> => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0301",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: maxTokens,
  });

  const content = response.data.choices[0].message?.content;
  if (!content) throw new ApolloError({ errorMessage: "Failed to generate" });

  // Save the generation in the DB
  const generationLog = await ctx.prisma.autoFlashcardsGeneration.create({
    data: {
      userId,
      inputText: `SYSTEM:\n${systemPrompt}\n\n---\n\nUSER:\n${prompt}`,
      generatedOutput: content,
    },
  });

  return [content, generationLog];
};

export default createChatGPTCompletion;
