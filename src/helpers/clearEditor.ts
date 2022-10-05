import { Transforms, Editor } from "slate";
import type { ReactEditor } from "slate-react";

/**
 * Completely clears a Slate editor
 * @param editor Slate editor to reset
 */
const clearEditor = (editor: ReactEditor) => {
  Transforms.delete(editor, {
    at: {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    },
  });
};

export default clearEditor;
