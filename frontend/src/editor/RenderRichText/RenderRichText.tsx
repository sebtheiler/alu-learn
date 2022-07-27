import FullEditable, { createFullEditor } from "../FullEditable";
import { useState, useMemo, useEffect } from "react";
import type { Node as SlateNode } from "slate";
import { Slate } from "slate-react";

// Renders Slate rich text
interface RenderRichTextProps {
  /**
   * Rich text to be rendered
   */
  text: SlateNode[];
  /**
   * Apply a fix to automatically update when the `text` prop is changed
   */
  fixSlateLazy?: boolean;
}

/**
 * Render SlateJS rich text
 */
export default function RenderRichText(props: RenderRichTextProps) {
  const { text, fixSlateLazy } = props;

  const [value, setValue] = useState(text);
  const editor = useMemo(() => createFullEditor(), []);

  useEffect(() => {
    try {
      if (fixSlateLazy) {
        // Slate is lazy and won't automatically update the editor when the flashcard
        // prop is changed, so we manually have to check if it has changed
        // The value dependency is excluded on purpose - including it causes infinite loop
        if (text !== value) {
          setValue(text);
        }
      }
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line
  }, [text, fixSlateLazy]);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={(newValue) => setValue(newValue)}
    >
      <FullEditable editor={editor} readOnly />
    </Slate>
  );
}
