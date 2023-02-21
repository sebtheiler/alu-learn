/**
 * Turns a given string of text into a slug
 * @param text Text to slugify
 * @returns The slugified text
 * @see https://www.30secondsofcode.org/js/s/slugify
 * @note Allows "." for common use in unit titles (e.g., "Unit 1.1" -> "unit-1.1")
 */
const slugifyText = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-.]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default slugifyText;
