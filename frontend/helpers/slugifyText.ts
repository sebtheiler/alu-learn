/**
 * Turns a given string of text into a slug
 * @param text Text to slugify
 * @returns The slugified text
 * @see https://stackoverflow.com/a/1054862/10226703
 * @note Allows "." for common use in unit titles (e.g., "Unit 1.1" -> "unit-1.1")
 */
const slugifyText = (text: string) =>
  text
    .toLowerCase()
    // Replaces spaces with "-"
    .replace(/ /g, "-")
    // Removes all multiple consective instances of dashes
    .replace(/[-]+/g, "-")
    // Removes all special characters other than "."
    .replace(/[`~!@#$%^&*()_\-+=[\]{};:'"\\|/,<>?\s]+/g, "");

export default slugifyText;
