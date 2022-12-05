import { ApolloError } from "apollo-server-micro";
import openai from "lib/openai";

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

export default createCompletion;
