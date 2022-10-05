import { nodes } from "@/editor/LexicalEditor/LexicalEditor";
import { createEditor } from "lexical";

/**
 * Turns a stringified editor state into a flat string
 * @param editorState String of the editor state to flatten
 * @returns Raw string of the editor state
 */
const flattenLexical = (editorState: string) => {
  const editor = createEditor({ nodes });
  const parsedEditorState = editor.parseEditorState(editorState);

  return new Promise<string | undefined>((resolve) => {
    parsedEditorState?.read(() => {
      resolve(parsedEditorState?._nodeMap.get("root")?.getTextContent());
    });
  });
};

export default flattenLexical;
