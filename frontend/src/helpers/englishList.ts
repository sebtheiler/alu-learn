/**
 * Turns an array of words into a human-readable list separated by commas
 * @example ["dogs"] => "dogs"
 * @example ["dogs", "cats"] => "dogs and cats"
 * @example ["dogs", "cats", "frogs"] => "dogs, cats, and frogs"
 * @param words Words to be split into a list
 * @returns A human-readable list
 */
const englishList = (words: string[]) => {
  if (words.length <= 1) return words[0];
  if (words.length === 2) return `${words[0]} and ${words[1]}`;
  return `${words.slice(0, words.length - 1).join(", ")}, and ${
    words[words.length - 1]
  }`;
};

export default englishList;
