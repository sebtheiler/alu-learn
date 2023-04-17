import createChatGPTCompletion from "./createChatGPTCompletion";

/**
 * Asynchronously fixes a given JSON string to be in the desired format.
 * If the input JSON string is not in the expected format, it uses GPT to fix it.
 * @param jsonStr - The JSON string to be fixed.
 * @param targetFormat - The desired format of the JSON string.
 * @returns A promise that resolves to the fixed JSON object.
 */
const fixJson = async (jsonStr: string, targetFormat: string): Promise<any> => {
  // If there is text before the JSON, try removing it
  const fixedCompletion = jsonStr.startsWith("[")
    ? jsonStr
    : "[" + jsonStr.split("[").slice(1).join("");
  try {
    return JSON.parse(fixedCompletion);
  } catch (e) {
    // If the output is in a bad format that we can't programatically fix, fix it with GPT
    const [aiFixedCompletion] = await createChatGPTCompletion({
      systemPrompt: `Fix this output to be in the correct JSON format:\n\n${targetFormat}`,
      prompt: jsonStr,
      maxTokens: 1024,
    });
    return JSON.parse(aiFixedCompletion);
  }
};

export default fixJson;
