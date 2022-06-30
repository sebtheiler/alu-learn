import FullEditor, { createFullEditor } from '../FullEditor';
import { Node as SlateNode } from 'slate';
import { Slate } from 'slate-react';
import { useState, useMemo, useEffect } from 'react';

// Renders Slate rich text
interface RenderRichTextProps {
  text: SlateNode[];
  fixSlateLazy?: boolean;
}
export default function RenderRichText(props: RenderRichTextProps) {
  const { text, fixSlateLazy } = props;

  const [value, setValue] = useState(text);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

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
      onChange={newValue => setValue(newValue)}
    >
      <FullEditor
        editor={editor}
        styleOptions={{ minHeight: '0' }}
        readOnly
      />
    </Slate>
  );
}
