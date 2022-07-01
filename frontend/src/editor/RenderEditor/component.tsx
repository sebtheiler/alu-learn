import EditorButtons from '../EditorButtons';
import FullEditable from '../FullEditable';
import { Node as SlateNode } from 'slate';
import { ReactEditor, Slate } from 'slate-react';

interface RenderEditorProps {
  /**
   * SlateJS editor to render
   */
  editor: ReactEditor;
  /**
   * Content of the editor
   */
  value: SlateNode[];
  /**
   * Function to update the content of the editor
   */
  setValue: (value: SlateNode[]) => void;
  /**
   * Should the flashcard link button be displayed?
   */
  displayFlashCardLinkButton?: boolean;
  /**
   * Is the user a pro user?
   */
  isPro?: boolean;
  /**
   * Is the content of the editor read only?
   */
  readOnly?: boolean;
}

/**
 * Render a full SlateJS editor, including buttons
 */
export default function RenderEditor({
  editor,
  value,
  setValue,
  displayFlashCardLinkButton,
  isPro,
  readOnly,
}: RenderEditorProps) {
  return (<div className='editor'>
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue);
      }}
    >
      <div className='editor-head'>
        <EditorButtons
          editor={editor}
          displayFlashCardLinkButton={displayFlashCardLinkButton}
          isPro={isPro}
          tabbable={false}
          className='mb-1'
          
        />
      </div>
      <div className='editor-body'>
        <FullEditable
          editor={editor}
          className='p-3 border rounded-lg'
          readOnly={readOnly}
        />
      </div>
    </Slate>
  </div>);
}
