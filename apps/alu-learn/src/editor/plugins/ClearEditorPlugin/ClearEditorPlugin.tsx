import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_EDITOR,
} from "lexical";
import { useEffect } from "react";

type Props = Readonly<{
  onClear?: () => void;
}>;

export default function ClearEditorPlugin({
  onClear,
}: Props): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      CLEAR_EDITOR_COMMAND,
      () => {
        editor.update(() => {
          if (onClear == null) {
            const root = $getRoot();
            const selection = $getSelection();
            const paragraph = $createParagraphNode();
            root.clear();
            root.append(paragraph);

            if (selection !== null) {
              paragraph.select();
            }
          } else {
            onClear();
          }
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, onClear]);

  return null;
}
