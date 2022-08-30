import EditorButton from "@/lexicalEditor/EditorButton";
import {
  faBold,
  faCode,
  faItalic,
  faRedo,
  faUnderline,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";
import {
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  CAN_REDO_COMMAND,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState } from "react";

const VL = () => (
  <div className="border-l-2 border-gray-200 h-full inline mx-2" />
);

/**
 *
 */
export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      console.log(
        "updating toolbar",
        { selection },
        $isRangeSelection(selection),
        selection.hasFormat("bold")
      );

      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsCode(selection.hasFormat("code"));
    }
  }, []);

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
    <div className="border-b-2 px-3 py-2 bg-gray-50 overflow-hidden rounded-t-lg">
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
    </div>
  );
}
