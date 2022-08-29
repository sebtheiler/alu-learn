import { Editor, Range, Transforms } from "slate";
import { ReactEditor } from "slate-react";

interface ClozeOptions {
  d;
}

const insertCloze = (editor: ReactEditor, clozeOptions: ClozeOptions) => {
  if (editor.selection) {
    wrapCloze(editor, clozeOptions);
  }
};

const isClozeActive = (editor: ReactEditor) => {
  // @ts-ignore
  const [cloze] = Editor.nodes(editor, { match: (n) => n.type === "cloze" });
  return !!cloze;
};

const unwrapCloze = (editor: ReactEditor) => {
  // @ts-ignore
  Transforms.unwrapNodes(editor, { match: (n) => n.type === "cloze" });
};

const wrapCloze = (editor: ReactEditor, clozeOptions: ClozeOptions) => {
  if (isClozeActive(editor)) {
    unwrapCloze(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const cloze = {
    type: "cloze",
    children: [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, cloze);
  } else {
    Transforms.wrapNodes(editor, cloze, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

export { insertCloze, isClozeActive, unwrapCloze, wrapCloze };
