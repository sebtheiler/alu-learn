import AutoLinkPlugin from "../plugins/AutoLinkPlugin";
import EquationPlugin from "../plugins/EquationPlugin";
import { EquationNode } from "../plugins/EquationPlugin/nodes";
import FloatingLinkEditorPlugin from "../plugins/FloatingLinkEditorPlugin";
import ImagePlugin from "../plugins/ImagePlugin";
import { ImageNode } from "../plugins/ImagePlugin/node";
import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "../plugins/MarkdownShortcutPlugin";
import MaxLengthPlugin from "../plugins/MaxLengthPlugin";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import styles from "./LexicalEditor.module.scss";
import classNames from "@/helpers/classNames";
import { CodeNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
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
  heading: {
    h1: styles.h1,
    h2: styles.h2,
    h3: styles.h3,
    h4: styles.h4,
    h5: styles.h5,
    h6: styles.h6,
  },
  list: {
    listitem: styles.listItem,
    nested: {
      listitem: styles.nestedListItem,
    },
    olDepth: [styles.ol1, styles.ol2, styles.ol3, styles.ol4, styles.ol5],
    ul: styles.ul,
  },
  code: styles.code,
  quote: styles.quote,
  link: styles.link,
};

const nodes = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  LinkNode,
  AutoLinkNode,
  EquationNode,
  ImageNode,
];

interface LexicalEditorProps {
  namespace: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  maxIndentLevel?: number | undefined;
  maxLength?: number | undefined;
}

/**
 *
 */
export default function LexicalEditor({
  namespace,
  readOnly = false,
  className,
  style,
  autoFocus,
  maxIndentLevel = 8,
  maxLength = 2000,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace,
    theme,
    nodes,
    onError,
    readOnly,
  };

  const editorStateRef = useRef<EditorState>();

  return (
    <div
      className={classNames(
        styles.surroundingDiv,
        "border-2 rounded-lg",
        className
      )}
      style={style}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<></>}
        />
        <OnChangePlugin
          onChange={(editorState) => {
            editorStateRef.current = editorState;
            console.log(editorState);
          }}
        />
        <HistoryPlugin />
        {autoFocus ? <AutofocusPlugin /> : ""}
        <ListPlugin />
        <LinkPlugin />
        {typeof window !== "undefined" ? (
          <FloatingLinkEditorPlugin anchorElem={document.body} />
        ) : (
          ""
        )}
        <EquationPlugin />
        <ImagePlugin />

        <ListMaxIndentLevelPlugin maxDepth={maxIndentLevel} />
        <MaxLengthPlugin maxLength={maxLength} />
        <MarkdownShortcutPlugin />
        <AutoLinkPlugin />
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
