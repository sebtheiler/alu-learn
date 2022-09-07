import type { EditorState } from "lexical";

/**
 * Turns an editor state into a flat string
 * @param editorState Editor state to flatten
 * @returns Raw string of the editor state
 */
const flattenLexical = (editorState: EditorState) =>
  new Promise<string | undefined>((resolve) => {
    editorState?.read(() => {
      resolve(editorState?._nodeMap.get("root")?.getTextContent());
    });
  });

export default flattenLexical;
