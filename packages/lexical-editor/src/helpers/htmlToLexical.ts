import { nodes } from "../LexicalEditor/LexicalEditor";
import { $createRangeSelection, createEditor } from "lexical";
import type { LexicalEditor } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { $insertGeneratedNodes } from "@lexical/clipboard";

/**
 * Converts an HTML string to a Lexical editor
 * @param html HTML string to convert
 * @returns A Lexical editor object with nodes representing the HTML
 */
const htmlToLexical = async (html: string): Promise<LexicalEditor> => {
  const editor = createEditor({ nodes });
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  return new Promise((resolve) => editor.update(() => {
    const lexicalNodes = $generateNodesFromDOM(editor, doc);
    const selection = $createRangeSelection();

    $insertGeneratedNodes(editor, lexicalNodes, selection);
    resolve(editor);
  }))
};

export default htmlToLexical;
