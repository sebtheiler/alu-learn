/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import styles from "./FloatingLinkEditorPlugin.module.scss";
import { sanitizeUrl } from "@/helpers/sanitizeUrl";
import { getSelectedNode } from "@/editor/helpers/getSelectedNode";
import { setFloatingElemPosition } from "@/editor/helpers/setFloatingElemPosition";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

function FloatingLinkEditor({
  editor,
  anchorElem,
  verticalOffset = 0,
}: {
  editor: LexicalEditor;
  anchorElem: HTMLElement;
  verticalOffset?: number;
}): JSX.Element {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<
    RangeSelection | GridSelection | NodeSelection | null
  >(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
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
    } else if (!activeElement || activeElement.className !== styles.linkInput) {
      if (rootElement !== null) {
        setFloatingElemPosition(null, editorElem, anchorElem, {
          verticalOffset,
        });
      }
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [anchorElem, editor, verticalOffset]);

  useEffect(() => {
    const scrollerElem = anchorElem.parentElement;

    const update = () => {
      editor.getEditorState().read(() => {
        updateLinkEditor();
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
  }, [anchorElem.parentElement, editor, updateLinkEditor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className={styles.linkEditor}>
      {isEditMode ? (
        <input
          ref={inputRef}
          className={styles.linkInput}
          value={linkUrl}
          onChange={(event) => {
            setLinkUrl(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (lastSelection !== null) {
                if (linkUrl !== "") {
                  editor.dispatchCommand(
                    TOGGLE_LINK_COMMAND,
                    sanitizeUrl(linkUrl)
                  );
                }
                setEditMode(false);
              }
            } else if (event.key === "Escape") {
              event.preventDefault();
              setEditMode(false);
            }
          }}
        />
      ) : (
        <>
          <div className={styles.linkInput}>
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {linkUrl}
            </a>
            <div
              className="absolute right-3 top-2 bottom-0"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setEditMode(true)}
            >
              <FontAwesomeIcon icon={faPencil} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function useFloatingLinkEditorToolbar(
  editor: LexicalEditor,
  anchorElem: HTMLElement,
  verticalOffset = 0
): JSX.Element | null {
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLink, setIsLink] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
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

  return isLink
    ? createPortal(
        <FloatingLinkEditor
          editor={activeEditor}
          anchorElem={anchorElem}
          verticalOffset={verticalOffset}
        />,
        anchorElem
      )
    : null;
}

export default function FloatingLinkEditorPlugin({
  anchorElem,
  verticalOffset = 0,
}: {
  anchorElem: HTMLElement;
  verticalOffset?: number;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  return useFloatingLinkEditorToolbar(editor, anchorElem, verticalOffset);
}
