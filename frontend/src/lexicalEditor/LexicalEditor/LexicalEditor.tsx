import ToolbarPlugin from "../plugins/ToolbarPlugin";
import styles from "./LexicalEditor.module.scss";
import classNames from "@/helpers/classNames";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { EditorState } from "lexical";
import { useEffect, useRef } from "react";

const onError = (error: Error) => console.error(error);

function AutofocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.focus();
  }, [editor]);

  return null;
}

const theme = {
  ltr: styles.ltr,
  rtl: styles.rtl,
  placeholder: styles.editorPlaceholder,
  paragraph: styles.editorParagraph,
  root: "test",
  text: {
    bold: styles.textBold,
    code: styles.textCode,
    italic: styles.textItalic,
    subscript: styles.textSubscript,
    superscript: styles.textSuperscript,
    underline: styles.textUnderline,
  },
};

interface LexicalEditorProps {
  namespace: string;
  readOnly?: boolean;
}

/**
 *
 */
export default function LexicalEditor({
  namespace,
  readOnly = false,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace,
    theme,
    onError,
    readOnly,
  };

  const editorStateRef = useRef<EditorState>();

  return (
    <div className={classNames(styles.surroundingDiv, "border-2 rounded-lg")}>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<></>}
        />
        <OnChangePlugin
          onChange={(editorState) => (editorStateRef.current = editorState)}
        />
        <HistoryPlugin />
        <AutofocusPlugin />
        {/* <Button
          onClick={() => console.log(JSON.stringify(editorStateRef.current))}
          className="mt-2"
        >
          Save
        </Button> */}
      </LexicalComposer>
    </div>
  );
}
