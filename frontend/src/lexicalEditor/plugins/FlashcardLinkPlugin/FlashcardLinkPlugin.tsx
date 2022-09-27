import { FlashcardLinkNode, toggleFlashcardLink } from "./nodes";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_EDITOR, createCommand } from "lexical";
import type { LexicalCommand } from "lexical";
import { useEffect } from "react";

type FlashcardLinkPluginPayload = {
  flashcardId: string;
};

export const TOGGLE_FLASHCARD_LINK_COMMAND: LexicalCommand<FlashcardLinkPluginPayload> =
  createCommand();

export default function FlashcardLinkPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([FlashcardLinkNode])) {
      throw new Error(
        "FlashcardLinkPlugin: FlashcardLinkNode not registered on editor"
      );
    }

    return editor.registerCommand<FlashcardLinkPluginPayload>(
      TOGGLE_FLASHCARD_LINK_COMMAND,
      (payload) => {
        if (typeof payload === "string" || payload === null) {
          toggleFlashcardLink(payload);
        } else {
          const { flashcardId } = payload;
          toggleFlashcardLink(flashcardId);
        }

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  });

  return <div></div>;
}
