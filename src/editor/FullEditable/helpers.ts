import { ExtendedReactEditor } from "../types";
import withFlashcardLinks from "@/editor/plugins/FlashcardLink";
import withLinks from "@/editor/plugins/Link";
import withSaveSelectionOnBlur from "@/editor/plugins/SaveSelectionOnBlur";
import withShortcuts from "@/editor/plugins/Shortcuts";
import {
  createEditor,
  Element as SlateElement,
  Editor,
  Transforms,
} from "slate";
import { withHistory } from "slate-history";
import { withReact } from "slate-react";
import type { ReactEditor } from "slate-react";

const LIST_TYPES = ["numbered-list", "bulleted-list"];

/**
 * Create an editor with all plugins
 * @returns Editor with full functionality from plugins
 */
const createFullEditor = () =>
  withFlashcardLinks(
    withSaveSelectionOnBlur(
      withShortcuts(
        withLinks(
          withHistory(
            withReact(
              // @ts-ignore
              createEditor()
            )
          )
        )
      )
    )
  );

const toggleBlock = (editor: ExtendedReactEditor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      // @ts-ignore
      LIST_TYPES.includes(n.type as string),
    split: true,
  });

  Transforms.setNodes(editor, {
    // @ts-ignore
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: ReactEditor, format: string) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: ReactEditor, format: string) => {
  const [match] = Editor.nodes(editor, {
    // @ts-ignore
    match: (n) => n.type === format,
  });

  return !!match;
};

const isMarkActive = (editor: ReactEditor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

export {
  createFullEditor,
  toggleBlock,
  toggleMark,
  isBlockActive,
  isMarkActive,
};
