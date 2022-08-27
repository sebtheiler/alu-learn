import EditorButtons from "../EditorButtons";
import FullEditable from "../FullEditable";
import type { ExtendedSlateElement } from "@/editor/types";
import classNames from "@/helpers/classNames";
import type { Descendant } from "slate";
import { Slate } from "slate-react";
import type { ReactEditor } from "slate-react";

interface RenderEditorProps {
  /**
   * SlateJS editor to render
   */
  editor: ReactEditor;
  /**
   * Content of the editor
   */
  value: Descendant[];
  /**
   * Function to update the content of the editor
   */
  setValue: React.Dispatch<React.SetStateAction<ExtendedSlateElement[]>>;
  /**
   * Should the flashcard link button be displayed?
   */
  displayFlashcardLinkButton?: boolean;
  /**
   * Is the user a pro user?
   */
  isPro?: boolean;
  /**
   * Is the content of the editor read only?
   */
  readOnly?: boolean;
  /**
   * Additional classes to apply to the full editable
   */
  className?: string;
  /**
   * Additional styles to apply to the full editable
   */
  style?: React.CSSProperties;
  /**
   * Automatically focus the editor on page load?
   */
  autoFocus?: boolean;
  /**
   * Specify an ID for the textbox div
   */
  id?: string;
}

/**
 * Render a full SlateJS editor, including buttons
 */
export default function RenderEditor({
  editor,
  value,
  setValue,
  displayFlashcardLinkButton,
  isPro,
  readOnly,
  className,
  style,
  autoFocus,
  id,
}: RenderEditorProps) {
  return (
    <div className={className}>
      <Slate
        editor={editor}
        value={value}
        // @ts-ignore
        onChange={(newValue) => setValue(newValue)}
      >
        <div>
          <EditorButtons
            editor={editor}
            displayFlashcardLinkButton={displayFlashcardLinkButton}
            isPro={isPro}
            tabbable={false}
            className="mb-1"
          />
        </div>
        <div>
          <FullEditable
            editor={editor}
            className={classNames("rounded-lg border-2 p-3", className)}
            readOnly={readOnly}
            style={style}
            autoFocus={autoFocus}
            id={id}
          />
        </div>
      </Slate>
    </div>
  );
}
