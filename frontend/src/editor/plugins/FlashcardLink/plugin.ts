import { ExtendedReactEditor } from "../../types";

const withFlashcardLinks = (editor: ExtendedReactEditor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    // @ts-ignore
    return element.type === "flashcard-link" ? true : isInline(element);
  };

  return editor;
};

export default withFlashcardLinks;
