import { ExtendedReactEditor } from "../../types";

const withFlashCardLinks = (editor: ExtendedReactEditor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    // @ts-ignore
    return element.type === "flashcard-link" ? true : isInline(element);
  };

  return editor;
};

export default withFlashCardLinks;
