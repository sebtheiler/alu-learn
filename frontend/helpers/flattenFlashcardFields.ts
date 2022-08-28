import flattenNodes from "@/helpers/flattenNodes";
import type { Node } from "slate";

/**
 * Turns a flashcards field into a flat string
 * @param fields Fields to flatten
 * @returns Raw string of the flattened fields
 */
const flattenFlashcardFields = (fields: { value: Node[][] }): string =>
  fields.value.map((field) => flattenNodes(field)).join("\n*-*-*\n");

export default flattenFlashcardFields;
