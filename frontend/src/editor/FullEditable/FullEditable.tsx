import Element from "./Element";
import Leaf from "./Leaf";
import { HOTKEYS } from "./constants";
import type { Hotkey } from "./constants";
import { toggleMark } from "./helpers";
import type { ExtendedReactEditor } from "editor/types";
import isHotKey from "is-hotkey";
import { useCallback } from "react";
import { Editable } from "slate-react";

interface FullEditorProps {
  /**
   * SlateJS editor to display
   */
  editor: ExtendedReactEditor;
  /**
   * Is the editor read only?
   */
  readOnly?: boolean;
  /**
   * Classname passed to the `<Editable>`
   */
  className?: string;
  id?: string;
}

/**
 * Renders an editable editor.
 * Does not include buttons, a toolbar, or other features
 */
export default function FullEditable({
  editor,
  readOnly,
  className,
  id,
}: FullEditorProps) {
  const renderElement = useCallback(
    (props) => <Element {...props} readOnly={readOnly} />,
    [readOnly]
  );
  const renderLeaf = useCallback(
    (props) => <Leaf {...props} readOnly={readOnly} />,
    [readOnly]
  );

  return (
    <Editable
      id={id}
      readOnly={readOnly}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      className={className}
      spellCheck
      onKeyDown={(event) => {
        for (const hotkey in HOTKEYS) {
          if (isHotKey(hotkey, event)) {
            event.preventDefault();
            const mark = HOTKEYS[hotkey as Hotkey];
            toggleMark(editor, mark);
          }
        }
      }}
      onBlur={editor.saveSelectionOnBlur}
    />
  );
}
