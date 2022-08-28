import flattenNodes from "@/helpers/flattenNodes";
import type { Flashcard } from "@/types";
import { Editor, Transforms, Range, Location } from "slate";
import { ReactEditor } from "slate-react";

const insertFlashcardLink = (editor: ReactEditor, flashcard: Flashcard) => {
  // @ts-ignore
  if (editor.blurSelection) {
    // @ts-ignore
    Transforms.select(editor, editor.blurSelection as Location);
  }
  if (editor.selection) {
    wrapFlashcardLink(editor, flashcard);
  }
  document.body.click();
  ReactEditor.focus(editor);
};

const isFlashcardLinkActive = (editor: ReactEditor) => {
  const [flashcardLink] = Editor.nodes(editor, {
    // @ts-ignore
    match: (n) => n.type === "flashcard-link",
  });
  return !!flashcardLink;
};

const unwrapFlashcardLink = (editor: ReactEditor) => {
  // @ts-ignore
  Transforms.unwrapNodes(editor, { match: (n) => n.type === "flashcard-link" });
};

const wrapFlashcardLink = (editor: ReactEditor, flashcard: Flashcard) => {
  if (isFlashcardLinkActive(editor)) {
    unwrapFlashcardLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const flashcardLink = {
    type: "flashcard-link",
    flashcardId: flashcard.id,
    children: isCollapsed
      ? [{ text: flattenNodes(flashcard.fields.value[0]) }]
      : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, flashcardLink);
  } else {
    Transforms.wrapNodes(editor, flashcardLink, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

export {
  insertFlashcardLink,
  isFlashcardLinkActive,
  unwrapFlashcardLink,
  wrapFlashcardLink,
};
