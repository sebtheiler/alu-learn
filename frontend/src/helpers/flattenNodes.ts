import { Node } from "slate";

/**
 * Flattens an array of Slate nodes to a text string
 * @param nodes Slate nodes to flatten
 * @returns A raw string of text
 */
export default function flattenNodes(nodes: Node[]): string {
  return nodes.map((n) => Node.string(n)).join("\n");
}
