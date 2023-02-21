/**
 * Capitalizes the first letter in a word or string of words
 * @param str String to capitalize
 * @param all If true, capitalize all of the words in a sentence (split by spaces)
 * @returns The capitalized string
 */
export default function capitalize(str: string, all = false) {
  if (all)
    return str
      .split(" ")
      .map((s) => capitalize(s))
      .join(" ");
  return str.charAt(0).toUpperCase() + str.slice(1);
}
