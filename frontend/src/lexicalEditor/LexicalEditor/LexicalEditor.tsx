import AutoLinkPlugin from "../plugins/AutoLinkPlugin";
import ClearEditorPlugin from "../plugins/ClearEditorPlugin";
import EquationPlugin from "../plugins/EquationPlugin";
import { EquationNode } from "../plugins/EquationPlugin/nodes";
import FlashcardLinkPlugin from "../plugins/FlashcardLinkPlugin/FlashcardLinkPlugin";
import { FlashcardLinkNode } from "../plugins/FlashcardLinkPlugin/nodes";
import FloatingLinkEditorPlugin from "../plugins/FloatingLinkEditorPlugin";
import ImagePlugin from "../plugins/ImagePlugin";
import { ImageNode } from "../plugins/ImagePlugin/node";
import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "../plugins/MarkdownShortcutPlugin";
import MaxLengthPlugin from "../plugins/MaxLengthPlugin";
import OverrideTabPlugin from "../plugins/OverrideTabPlugin";
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
import type { EditorState, LexicalEditor as Editor } from "lexical";
import { useEffect } from "react";

const onError = (error: Error) => console.error(error);

interface BasicFeaturesPluginProps {
  autoFocus: boolean;
  readOnly: boolean;
  editorState: string | null;
}
function BasicFeaturesPlugin({
  autoFocus,
  readOnly,
  editorState,
}: BasicFeaturesPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    autoFocus && editor.focus();
  }, [editor, autoFocus]);

  useEffect(() => {
    editor.setReadOnly(readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editorState) return;
    editor.setEditorState(editor.parseEditorState(editorState));
  }, [editor, editorState]);

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
  flashcardLink: styles.flashcardLink,
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
  FlashcardLinkNode,
];

interface LexicalEditorProps {
  namespace: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  maxIndentLevel?: number | undefined;
  maxLength?: number | undefined;
  verticalOffset?: number;
  clearEditorRef?: React.MutableRefObject<HTMLButtonElement | null>;
  onChange?(editorState: EditorState, editor: Editor): void;
  overrideTab?: boolean;
  editorState?: string | null;
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
  verticalOffset = 0,
  clearEditorRef,
  onChange,
  overrideTab = false,
  editorState = null,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace,
    theme,
    nodes,
    onError,
    readOnly,
    editorState,
  };

  return (
    <div
      className={classNames(
        !readOnly && styles.surroundingDiv,
        !readOnly && "border-2 rounded-lg",
        className
      )}
      style={style}
      id={namespace}
    >
      <LexicalComposer initialConfig={initialConfig}>
        {!readOnly ? <ToolbarPlugin clearEditorRef={clearEditorRef} /> : ""}
        <RichTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<></>}
        />
        {onChange ? <OnChangePlugin onChange={onChange} /> : ""}
        <HistoryPlugin />
        <BasicFeaturesPlugin
          autoFocus={autoFocus ?? false}
          readOnly={readOnly}
          editorState={editorState}
        />
        <ListPlugin />
        <LinkPlugin />
        {typeof window !== "undefined" ? (
          <FloatingLinkEditorPlugin
            anchorElem={document.body}
            verticalOffset={verticalOffset}
          />
        ) : (
          ""
        )}
        <FlashcardLinkPlugin />
        <EquationPlugin />
        <ImagePlugin />

        {overrideTab ? <OverrideTabPlugin /> : ""}
        <ListMaxIndentLevelPlugin maxDepth={maxIndentLevel} />
        <MaxLengthPlugin maxLength={maxLength} />
        <MarkdownShortcutPlugin />
        <AutoLinkPlugin />
        <ClearEditorPlugin />
      </LexicalComposer>
    </div>
  );
}
