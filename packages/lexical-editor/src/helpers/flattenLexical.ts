import { nodes } from "../LexicalEditor/LexicalEditor";
import { $getRoot, createEditor } from "lexical";

/**
 * Turns a stringified editor state into a flat string
 * @param editorState String of the editor state to flatten
 * @returns Raw string of the editor state
 */
function flattenLexical(editorState: string): string {
  const editor = createEditor({ nodes });
  const parsedEditorState = editor.parseEditorState(editorState);

  return parsedEditorState.read(() => $getRoot().getTextContent());
}


export default flattenLexical;
