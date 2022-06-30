import EditorButtons from '../EditorButtons';
import FullEditor from '../FullEditor';
import { Node as SlateNode } from 'slate';
import { ReactEditor, Slate } from 'slate-react';

interface RenderEditorProps {
  value: SlateNode[];
  setValue: (value: SlateNode[]) => void;
  isFlashCard?: boolean;
  editor: ReactEditor;
  isPro?: boolean;
}

export default function RenderEditor({
  editor,
  value,
  setValue,
  isFlashCard,
  isPro,
}: RenderEditorProps) {
  return (<div className='editor'>
    <div className='editor-head'>
      <EditorButtons
        editor={editor}
        isFlashCard={isFlashCard}
        isPro={isPro}
        untabbable
      />
    </div>
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue);
      }}
    >
      <div className='editor-body'>
        <FullEditor
          editor={editor}
          styleOptions={{ minHeight: '200px' }}
        />
      </div>
    </Slate>
  </div>);
}
