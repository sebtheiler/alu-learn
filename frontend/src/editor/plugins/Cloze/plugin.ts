import type { ExtendedReactEditor, ExtendedSlateElement } from "../../types";

const withCloze = (editor: ExtendedReactEditor) => {
  const { isInline } = editor;

  editor.isInline = (element: ExtendedSlateElement) =>
    element.type === "cloze" ? true : isInline(element);

  return editor;
};

export default withCloze;
