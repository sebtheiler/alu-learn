import { ClozeColor } from "./colors";
import { ClozeDeletionNode, toggleClozeDeletion } from "./nodes";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_EDITOR, createCommand, KEY_DOWN_COMMAND } from "lexical";
import type { LexicalCommand } from "lexical";
import { useEffect } from "react";
import { mergeRegister } from "@lexical/utils";
import useIsApple from "../../helpers/useIsApple";

type ClozeDeletionPluginPayload = {
  color: ClozeColor;
  hint: string;
};

export const TOGGLE_CLOZE_DELETION_COMMAND: LexicalCommand<ClozeDeletionPluginPayload> =
  createCommand();

export default function ClozeDeletionPlugin() {
  const [editor] = useLexicalComposerContext();
  const IS_APPLE = useIsApple();

  useEffect(() => {
    if (!editor.hasNodes([ClozeDeletionNode])) {
      throw new Error(
        "ClozeDeletionPlugin: ClozeDeletionNode not registered on editor"
      );
    }

    return mergeRegister(
      editor.registerCommand<ClozeDeletionPluginPayload>(
        TOGGLE_CLOZE_DELETION_COMMAND,
        (payload) => {
          const { color, hint } = payload;
          toggleClozeDeletion({ color, hint });

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (payload) => {
          const { key, shiftKey, ctrlKey, metaKey } = payload;
          // ctrl/cmd+shift+c to insert cloze
          if (key.toLocaleLowerCase() === "c" && shiftKey && (IS_APPLE ? metaKey : ctrlKey)) {
            payload.preventDefault();
            editor.dispatchCommand(TOGGLE_CLOZE_DELETION_COMMAND, {
              color: "YELLOW",
              hint: "",
            })
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      )
    )
  });

  return <div></div>;
}
