import { TOGGLE_CLOZE_DELETION_COMMAND } from "./ClozeDeletionPlugin";
import { ClozeColor, colorOptions } from "./colors";
import { $isClozeDeletionNode } from "./nodes";
import Button from "@/atoms/Button";
import Select from "@/atoms/Select";
import TextInput from "@/atoms/TextInput";
import { getSelectedNode } from "@/editor/helpers/getSelectedNode";
import { setFloatingElemPosition } from "@/editor/helpers/setFloatingElemPosition";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  GridSelection,
  LexicalEditor,
  NodeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function FloatingClozeDeletionEditor({
  editor,
  anchorElem,
  verticalOffset = 0,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  verticalOffset?: number;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [color, setColor] = useState("");
  const [hint, setHint] = useState("");
  const [lastSelection, setLastSelection] = useState<
    RangeSelection | GridSelection | NodeSelection | null
  >(null);

  const updateClozeDeletionEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isClozeDeletionNode(parent)) {
        setColor(parent.getColor());
        setHint(parent.getHint());
      } else if ($isClozeDeletionNode(node)) {
        setColor(node.getColor());
        setHint(node.getHint());
      } else {
        setColor("");
        setHint("");
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      selection !== null &&
      nativeSelection !== null &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect: DOMRect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild as HTMLElement;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      setFloatingElemPosition(rect, editorElem, anchorElem, { verticalOffset });
      setLastSelection(selection);
    } else if (!activeElement) {
      if (rootElement !== null) {
        setFloatingElemPosition(null, editorElem, anchorElem, {
          verticalOffset,
        });
      }
      setLastSelection(null);
      setColor("");
      setHint("");
    }

    return true;
  }, [anchorElem, editor, verticalOffset]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateClozeDeletionEditor();
      });
    };

    window.addEventListener("resize", update);

    if (scrollerElem) {
      scrollerElem.addEventListener("scroll", update);
    }

    return () => {
      window.removeEventListener("resize", update);

      if (scrollerElem) {
        scrollerElem.removeEventListener("scroll", update);
      }
    };
  }, [anchorElem.parentElement, editor, updateClozeDeletionEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateClozeDeletionEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateClozeDeletionEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  });

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateClozeDeletionEditor();
    });
  }, [editor, updateClozeDeletionEditor]);

  const updateClozeDeletion = useCallback(() => {
    if (lastSelection !== null) {
      if (color !== "") {
        editor.dispatchCommand(TOGGLE_CLOZE_DELETION_COMMAND, {
          color: color as ClozeColor,
          hint,
        });
      }
    }
  }, [editor, lastSelection, color, hint]);

  return (
    <div
      ref={editorRef}
      className="absolute z-10 max-w-sm w-full opacity-0 -top-16 -left-16 bg-alu-light-gray border-4 rounded-xl shadow-md transition-opacity duration-500 px-4 py-3"
    >
      <h3 className="text-center font-bold text-lg mb-2">Edit Cloze</h3>
      <Select
        label="Color"
        name="color"
        value={color}
        onChange={(v) => setColor(v as string)}
        className="mb-3"
        options={colorOptions}
      />
      <TextInput
        label="Hint (optional)"
        value={hint}
        onChange={(e) => setHint(e.target.value)}
        className="mb-3"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            updateClozeDeletion();
          }
        }}
      />
      <Button onClick={updateClozeDeletion} block>
        Save
      </Button>
    </div>
  );
}

function useClozeDeletionEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  verticalOffset = 0
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isClozeDeletion, setIsClozeDeletion] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isClozeDeletionNode(parent) || $isClozeDeletionNode(node)) {
        setIsClozeDeletion(true);
      } else {
        setIsClozeDeletion(false);
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  return isClozeDeletion
    ? createPortal(
        <FloatingClozeDeletionEditor
          editor={activeEditor}
          anchorElem={anchorElem}
          verticalOffset={verticalOffset}
        />,
        anchorElem
      )
    : null;
}

export default function FloatingClozeDeletionEditorPlugin({
  anchorElem,
  verticalOffset = 0,
}: {
  anchorElem: HTMLElement;
  verticalOffset?: number;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useClozeDeletionEditorToolbar(editor, anchorElem, verticalOffset);
}
