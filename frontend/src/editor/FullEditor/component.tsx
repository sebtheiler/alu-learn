import Element from './Element';
import Leaf from './Leaf';
import isHotKey from 'is-hotkey';
import { Editable } from 'slate-react';
import { ExtendedReactEditor } from 'editor/types';
import { HOTKEYS } from './constants';
import { toggleMark } from './helpers';
import { useCallback } from 'react';
import './style.scss';

interface FullEditorProps {
  editor: ExtendedReactEditor;
  readOnly?: boolean;
  styleOptions?: {
    minHeight?: string; /**E.g., 200px */
    showBorder?: boolean;
  };
  id?: string;
}
export default function FullEditor(props: FullEditorProps) {
  const { editor, readOnly, styleOptions, id } = props;
  const { minHeight, showBorder } = styleOptions ? styleOptions : { showBorder: true, minHeight: undefined };

  const renderElement = useCallback(props => <Element {...props} readOnly={readOnly} />, [readOnly]);
  const renderLeaf = useCallback(props => <Leaf {...props} readOnly={readOnly} />, [readOnly]);

  return (
    <Editable
      id={id}
      readOnly={readOnly}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      className='rich-text-editor'
      spellCheck
      style={{
        borderStyle: showBorder ? 'solid' : 'none',
        minHeight: minHeight ? minHeight : '600px',
      }}
      onKeyDown={event => {
        for (const hotkey in HOTKEYS) {
          if (isHotKey(hotkey, event as any)) {
            event.preventDefault();
            const mark = HOTKEYS[hotkey];
            toggleMark(editor, mark);
          }
        }
      }}

      onBlur={editor.saveSelectionOnBlur}
    />
  );
}
