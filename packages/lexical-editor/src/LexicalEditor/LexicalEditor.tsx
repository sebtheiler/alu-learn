import AutoLinkPlugin from "../plugins/AutoLinkPlugin";
import ClearEditorPlugin from "../plugins/ClearEditorPlugin";
import ClozeDeletionPlugin from "../plugins/ClozeDeletionPlugin/ClozeDeletionPlugin";
import FloatingClozeDeletionEditorPlugin from "../plugins/ClozeDeletionPlugin/floatingEditor";
import { ClozeDeletionNode } from "../plugins/ClozeDeletionPlugin/nodes";
import EquationPlugin from "../plugins/EquationPlugin";
import { EquationNode } from "../plugins/EquationPlugin/nodes";
import FlashcardLinkPlugin from "../plugins/FlashcardLinkPlugin/FlashcardLinkPlugin";
import { FlashcardLinkNode } from "../plugins/FlashcardLinkPlugin/nodes";
import FlashcardLinkPopoverPlugin from "../plugins/FlashcardLinkPlugin/popover";
import FloatingLinkEditorPlugin from "../plugins/FloatingLinkEditorPlugin";
import ImagePlugin from "../plugins/ImagePlugin";
import { ImageNode } from "../plugins/ImagePlugin/node";
import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "../plugins/MarkdownShortcutPlugin";
import MaxLengthPlugin from "../plugins/MaxLengthPlugin";
import OverrideTabPlugin from "../plugins/OverrideTabPlugin";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import styles from "./LexicalEditor.module.scss";
import classNames from "helpers-lib/src/classNames";
import { CodeNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import type { EditorState, LexicalEditor as Editor } from "lexical";
import { useEffect, useLayoutEffect } from "react";
import ExtractPlugin from "../plugins/ExtractPlugin/ExtractPlugin";
import { ExtractNode } from "../plugins/ExtractPlugin/nodes";

const onError = (error: Error) => console.error(error);

interface BasicFeaturesPluginProps {
  autoFocus: boolean;
  editable: boolean;
  editorState: string | null;
  editorRef: React.MutableRefObject<Editor | null> | undefined;
}
function BasicFeaturesPlugin({
  autoFocus,
  editable,
  editorState,
  editorRef,
}: BasicFeaturesPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    autoFocus && editor.focus();
  }, [editor, autoFocus]);

  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editorState) return;
    try {
      editor.setEditorState(editor.parseEditorState(editorState));
    } catch (e) {
      console.error("Error updating Lexical editor state");
      console.error(e);
    }
  }, [editor, editorState]);

  useLayoutEffect(() => {
    if (!editorRef) return;
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor, editorRef]);

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
  clozeDeletion: styles.clozeDeletion,
  clozeDeletionBlank: styles.clozeDeletionBlank,
  extract: styles.extract,
};

export const nodes = [
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
  ClozeDeletionNode,
  ExtractNode,
];

interface LexicalEditorProps {
  /**
   * Namespace for the editor
   */
  namespace: string;
  /**
   * Is the editor editable? Set to `false` when just rendering text
   */
  editable?: boolean;
  /**
   * Classname for the wrapping div
   */
  className?: string;
  /**
   * Style for the wrapping div
   */
  style?: React.CSSProperties;
  /**
   * Autofocus the editor?
   */
  autoFocus?: boolean;
  /**
   * Maximum times a list (numbered or bulleted) can be indented
   */
  maxIndentLevel?: number | undefined;
  /**
   * Maximum number of characters allowed in the editor
   */
  maxLength?: number | undefined;
  /**
   * Vertical offset for the floating link editor plugin
   */
  verticalOffset?: number;
  /**
   * Supplies a button that can be clicked to clear the editor.
   * @example
   * ```js
   * const ref = useRef<HTMLButtonElement | null>(null);
   * <LexicalEditor clearEditorRef={ref} ... />
   * ref.click(); // clears the editor
   * ```
   */
  clearEditorRef?: React.MutableRefObject<HTMLButtonElement | null>;
  /**
   * Called whenever the state of the editor changes
   * @param editorState New state of the editor
   * @param editor The editor
   */
  onChange?(editorState: EditorState, editor: Editor): void;
  /**
   * If true, tab goes to the next element rather than creating an indent
   */
  overrideTab?: boolean;
  /**
   * Initial state for the editor
   */
  editorState?: string | null;
  /**
   * Disable popovers (e.g., the floating link editor and the flashcard link popover)
   */
  disablePopovers?: boolean;
  /**
   * Include the `cloze` option in the editor
   */
  includeCloze?: boolean;
  /**
   * If set:
   * (a) includes extracts in the editor and
   * (b) runs a callback when an extract is created
   */
  createExtractCallback?(generatedHtml: string): void;
  /**
   * Does the user have pro mode? (e.g., for inserting flashcard links)
   */
  isPro?: boolean;
  /**
   * Ref to access the editor
   */
  editorRef?: React.MutableRefObject<Editor | null>;
}

/**
 *
 */
export default function LexicalEditor({
  namespace,
  editable = true,
  className,
  style,
  autoFocus,
  maxIndentLevel = 8,
  maxLength = 2000,
  verticalOffset = 0,
  clearEditorRef,
  editorRef,
  onChange,
  disablePopovers,
  overrideTab = false,
  editorState = null,
  includeCloze = false,
  createExtractCallback,
  isPro = false,
}: LexicalEditorProps) {
  const initialConfig = {
    namespace,
    theme,
    nodes,
    onError,
    editable,
    editorState,
  };

  return (
    <div
      className={classNames(
        editable && styles.surroundingDiv,
        editable && "border-2 rounded-lg",
        className
      )}
      style={style}
      id={namespace}
    >
      <LexicalComposer initialConfig={initialConfig}>
        {editable ? (
          <ToolbarPlugin
            clearEditorRef={clearEditorRef}
            isPro={isPro}
            includeCloze={includeCloze}
            includeExtract={!!createExtractCallback}
          />
        ) : (
          ""
        )}
        <RichTextPlugin
          ErrorBoundary={LexicalErrorBoundary}
          contentEditable={<ContentEditable spellCheck />}
          placeholder={<></>}
        />
        {onChange ? <OnChangePlugin onChange={onChange} /> : ""}
        <HistoryPlugin />
        <BasicFeaturesPlugin
          autoFocus={autoFocus ?? false}
          editable={editable}
          editorState={editorState}
          editorRef={editorRef}
        />
        <ListPlugin />
        <LinkPlugin />
        {typeof window !== "undefined" && !disablePopovers ? (
          <>
            <FloatingLinkEditorPlugin
              anchorElem={document.body}
              verticalOffset={verticalOffset}
            />
            <FlashcardLinkPopoverPlugin anchorElem={document.body} />
            <FloatingClozeDeletionEditorPlugin
              anchorElem={document.body}
              verticalOffset={verticalOffset}
            />
          </>
        ) : (
          ""
        )}
        <FlashcardLinkPlugin />
        <ClozeDeletionPlugin />
        {!!createExtractCallback ? (
          <ExtractPlugin createExtractCallback={createExtractCallback} />
        ) : (
          ""
        )}
        <EquationPlugin />
        <ImagePlugin />

        {overrideTab ? <OverrideTabPlugin /> : ""}
        <ListMaxIndentLevelPlugin maxDepth={maxIndentLevel} />
        {maxLength > 0 ? <MaxLengthPlugin maxLength={maxLength} /> : ""}
        <MarkdownShortcutPlugin />
        <AutoLinkPlugin />
        <ClearEditorPlugin />
      </LexicalComposer>
    </div>
  );
}
