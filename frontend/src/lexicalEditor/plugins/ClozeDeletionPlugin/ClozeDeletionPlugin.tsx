import { ClozeDeletionNode, toggleClozeDeletion } from "./nodes";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";
import type { LexicalCommand } from "lexical";
import { useEffect } from "react";

type ClozeColor =
  | "BLUE"
  | "GREEN"
  | "LIME"
  | "ORANGE"
  | "PINK"
  | "PURPLE"
  | "RED"
  | "SKY"
  | "YELLOW";

type ClozeDeletionPluginPayload = {
  color: ClozeColor;
  hint: string;
};

export const TOGGLE_CLOZE_DELETION_COMMAND: LexicalCommand<ClozeDeletionPluginPayload> =
  createCommand();

export default function ClozeDeletionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ClozeDeletionNode])) {
      throw new Error(
        "ClozeDeletionPlugin: ClozeDeletionNode not registered on editor"
      );
    }

    return editor.registerCommand<ClozeDeletionPluginPayload>(
      TOGGLE_CLOZE_DELETION_COMMAND,
      (payload) => {
        const { color, hint } = payload;
        toggleClozeDeletion({ color, hint });

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  });

  return <div></div>;
}
