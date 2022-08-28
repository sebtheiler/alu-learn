import { BaseSelection, Element as SlateElement } from "slate";
import { ReactEditor } from "slate-react";

/**
 * Extended implementation of SlateJS's `ReactEditor`
 */
interface ExtendedReactEditor extends ReactEditor {
  /**
   * Saves the current selection when the editor is blurred
   */
  saveSelectionOnBlur?: () => void;
  /**
   * Saved copy of the selection
   */
  blurSelection?: BaseSelection;
}

interface ExtendedSlateElement extends SlateElement {
  url?: string;
  type?: string;
  flashcardId?: string;
}

export type { ExtendedReactEditor, ExtendedSlateElement };
