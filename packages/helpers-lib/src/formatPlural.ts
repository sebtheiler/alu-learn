/**
 * Takes a count, a noun, and an optional plural form, and returns a formatted string with the count and noun properly pluralized.
 * If count is 1, only the noun is returned; otherwise, the noun is pluralized with an 's' suffix (or with the specified plural form if provided).
 * @param count Number of items
 * @param noun The word to make plural
 * @param plural Optionally provide an override plural word (e.g., "children", not "childs" in the plural of "child")
 * @returns A string with the formatted plural word (e.g., "10 flashcards")
 */
const formatPlural = (
  count: number,
  noun: string,
  plural: string | undefined = undefined
) => {
  if (count === 1) {
    return `${count} ${noun}`;
  }
  if (plural) return plural;
  return `${count} ${noun}s`;
};

export default formatPlural;
