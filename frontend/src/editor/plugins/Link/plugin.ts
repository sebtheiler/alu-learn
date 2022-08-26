import { wrapLink } from "./helpers";
import isUrl from "@/helpers/isUrl";
import { ReactEditor } from "slate-react";

const withLinks = (editor: ReactEditor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element) => {
    // @ts-ignore
    return element.type === "link" ? true : isInline(element);
  };

  // If pasting a link, automatically make it a link
  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

export default withLinks;
