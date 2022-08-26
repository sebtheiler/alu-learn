import flattenNodes from "@/helpers/flattenNodes";
import { FlashCard } from "@types";
import { Editor, Transforms, Range, Location } from "slate";
import { ReactEditor } from "slate-react";

const insertFlashCardLink = (editor: ReactEditor, flashcard: FlashCard) => {
  // @ts-ignore
  if (editor.blurSelection) {
    // @ts-ignore
    Transforms.select(editor, editor.blurSelection as Location);
  }
  if (editor.selection) {
    wrapFlashCardLink(editor, flashcard);
  }
  document.body.click();
  ReactEditor.focus(editor);
};

const isFlashCardLinkActive = (editor: ReactEditor) => {
  // @ts-ignore
  const [flashcardLink] = Editor.nodes(editor, {
    match: (n) => n.type === "flashcard-link",
  });
  return !!flashcardLink;
};

const unwrapFlashCardLink = (editor: ReactEditor) => {
  // @ts-ignore
  Transforms.unwrapNodes(editor, { match: (n) => n.type === "flashcard-link" });
};

const wrapFlashCardLink = (editor: ReactEditor, flashcard: FlashCard) => {
  if (isFlashCardLinkActive(editor)) {
    unwrapFlashCardLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const flashcardLink = {
    type: "flashcard-link",
    flashcardUID: flashcard.universal_flashcard_id ?? flashcard.id,
    children: isCollapsed
      ? [{ text: flattenNodes(flashcard.data.fields[0]) }]
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
  insertFlashCardLink,
  isFlashCardLinkActive,
  unwrapFlashCardLink,
  wrapFlashCardLink,
};
