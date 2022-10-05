import type { ExtendedReactEditor, ExtendedSlateElement } from "../../types";

const withFlashcardLinks = (editor: ExtendedReactEditor) => {
  const { isInline } = editor;

  editor.isInline = (element: ExtendedSlateElement) =>
    element.type === "flashcard_link" ? true : isInline(element);

  return editor;
};

export default withFlashcardLinks;
