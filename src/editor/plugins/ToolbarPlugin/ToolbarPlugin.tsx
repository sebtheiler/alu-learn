import { TOGGLE_CLOZE_DELETION_COMMAND } from "../ClozeDeletionPlugin/ClozeDeletionPlugin";
import { $isClozeDeletionNode } from "../ClozeDeletionPlugin/nodes";
import InsertEquationModal from "../EquationPlugin/modal";
import FlashcardLinkButton from "../FlashcardLinkPlugin/button";
import { $isFlashcardLinkNode } from "../FlashcardLinkPlugin/nodes";
import InsertImageModal from "../ImagePlugin/modal";
import Dropdown from "@/atoms/Dropdown";
import EditorButton from "@/editor/EditorButton";
import { getSelectedNode } from "@/editor/helpers/getSelectedNode";
import classNames from "@/helpers/classNames";
import { sanitizeUrl } from "@/helpers/sanitizeUrl";
import {
  faAngleDown,
  faBold,
  faCode,
  faHeading,
  faHighlighter,
  faImage,
  faItalic,
  faLink,
  faListDots,
  faListNumeric,
  faParagraph,
  faPlus,
  faQuoteLeft,
  faRedo,
  faSquareRootVariable,
  faUnderline,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { $createCodeNode } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  ListNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $isHeadingNode,
  HeadingTagType,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { $wrapLeafNodesInElements } from "@lexical/selection";
import { mergeRegister, $getNearestNodeOfType } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CLEAR_EDITOR_COMMAND,
} from "lexical";
import {
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  CAN_REDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
} from "lexical";
import type { LexicalEditor } from "lexical";
import { useCallback, useEffect, useState } from "react";

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

const VL = ({ className }: { className?: string }) => (
  <div
    className={classNames(
      className,
      "border-l-2 border-gray-200 h-full inline mx-2"
    )}
  />
);

/**
 *
 */
export default function ToolbarPlugin({ clearEditorRef, includeCloze }) {
  const [editor] = useLexicalComposerContext();

  // Text formatting
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isFlashcardLink, setIsFlashcardLink] = useState(false);
  const [isClozeDeletion, setIsClozeDeletion] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Block formatting
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsCode(selection.hasFormat("code"));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      // ...and flashcard links
      if ($isFlashcardLinkNode(parent) || $isFlashcardLinkNode(node)) {
        setIsFlashcardLink(true);
      } else {
        setIsFlashcardLink(false);
      }

      // ...and cloze
      if ($isClozeDeletionNode(parent) || $isClozeDeletionNode(node)) {
        setIsClozeDeletion(true);
      } else {
        setIsClozeDeletion(false);
      }

      // Update block format
      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  return (
    <div className="border-b-2 px-3 py-2 bg-gray-50 rounded-t-lg">
      <EditorButton
        command={UNDO_COMMAND}
        title="Undo"
        faIcon={faUndo}
        shortcut="mod+z"
        disabled={!canUndo}
      />
      <EditorButton
        command={REDO_COMMAND}
        title="Redo"
        faIcon={faRedo}
        shortcut="mod+y"
        disabled={!canRedo}
      />
      <VL />
      <EditorButton
        command={FORMAT_TEXT_COMMAND}
        payload="bold"
        title="Bold"
        faIcon={faBold}
        shortcut="mod+b"
        isActive={isBold}
      />
      <EditorButton
        command={FORMAT_TEXT_COMMAND}
        payload="italic"
        title="Italic"
        faIcon={faItalic}
        shortcut="mod+i"
        isActive={isItalic}
      />
      <EditorButton
        command={FORMAT_TEXT_COMMAND}
        payload="underline"
        title="Underline"
        faIcon={faUnderline}
        shortcut="mod+u"
        isActive={isUnderline}
      />
      <EditorButton
        command={FORMAT_TEXT_COMMAND}
        payload="code"
        title="Inline Code"
        faIcon={faCode}
        isActive={isCode}
      />
      <EditorButton
        command={TOGGLE_LINK_COMMAND}
        payload={isLink ? null : sanitizeUrl("https://")}
        faIcon={faLink}
        title="Link"
        isActive={isLink}
      />
      <VL />
      <FlashcardLinkButton isActive={isFlashcardLink} />
      {includeCloze && (
        <EditorButton
          command={TOGGLE_CLOZE_DELETION_COMMAND}
          payload={isClozeDeletion ? null : { color: "YELLOW", hint: "" }}
          faIcon={faHighlighter}
          title="Cloze"
          isActive={isClozeDeletion}
        />
      )}
      <VL />
      <InsertDropdown editor={editor} />
      <VL />
      <BlockFormatDropdown editor={editor} blockType={blockType} />
      {clearEditorRef && (
        <button
          onClick={() =>
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
          }
          ref={clearEditorRef}
          tabIndex={-1}
        />
      )}
    </div>
  );
}

interface InsertDropdownProps {
  editor: LexicalEditor;
}

function InsertDropdown({ editor }: InsertDropdownProps) {
  const [showEquationModal, setShowEquationModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
      <Dropdown
        options={[
          {
            text: "Image",
            onClick: () => setShowImageModal(true),
            faIcon: faImage,
          },
          {
            text: "Equation",
            onClick: () => setShowEquationModal(true),
            faIcon: faSquareRootVariable,
          },
        ]}
        menuButtonProps={{ tabIndex: "-1" }}
      >
        <span className="hover:bg-gray-200 p-1 rounded-md">
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Insert
        </span>
      </Dropdown>
      <InsertEquationModal
        open={showEquationModal}
        close={() => setShowEquationModal(false)}
        editor={editor}
      />
      <InsertImageModal
        open={showImageModal}
        close={() => setShowImageModal(false)}
        editor={editor}
      />
    </>
  );
}

interface BlockFormatDropdownProps {
  editor: LexicalEditor;
  blockType: keyof typeof blockTypeToBlockName;
}

function BlockFormatDropdown({ editor, blockType }: BlockFormatDropdownProps) {
  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapLeafNodesInElements(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapLeafNodesInElements(selection, () =>
            $createHeadingNode(headingSize)
          );
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapLeafNodesInElements(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            $wrapLeafNodesInElements(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection.insertRawText(textContent);
          }
        }
      });
    }
  };

  return (
    <Dropdown
      options={[
        {
          text: "Normal",
          onClick: formatParagraph,
          active: blockType === "paragraph",
          faIcon: faParagraph,
        },
        {
          text: "Heading 1",
          onClick: () => formatHeading("h1"),
          active: blockType === "h1",
          faIcon: faHeading,
        },
        {
          text: "Heading 2",
          onClick: () => formatHeading("h2"),
          active: blockType === "h2",
          faIcon: faHeading,
        },
        {
          text: "Heading 3",
          onClick: () => formatHeading("h3"),
          active: blockType === "h3",
          faIcon: faHeading,
        },
        {
          text: "Bulleted List",
          onClick: formatBulletList,
          active: blockType === "bullet",
          faIcon: faListDots,
        },
        {
          text: "Numbered List",
          onClick: formatNumberedList,
          active: blockType === "number",
          faIcon: faListNumeric,
        },
        {
          text: "Quote",
          onClick: formatQuote,
          active: blockType === "quote",
          faIcon: faQuoteLeft,
        },
        {
          text: "Code",
          onClick: formatCode,
          active: blockType === "code",
          faIcon: faCode,
        },
      ]}
      menuButtonProps={{ tabIndex: "-1" }}
    >
      <span className="hover:bg-gray-200 p-1 rounded-md">
        {blockTypeToBlockName[blockType]} <FontAwesomeIcon icon={faAngleDown} />
      </span>
    </Dropdown>
  );
}
