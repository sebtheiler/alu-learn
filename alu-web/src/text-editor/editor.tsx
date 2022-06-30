import isHotKey from 'is-hotkey';
import { Editable, ReactEditor } from 'slate-react';
import { Element as SlateElement, BaseSelection, Editor, Transforms } from 'slate';
import { Element, Leaf } from './renderer';
import { createEditor } from 'slate';
import { useCallback } from 'react';
import { withFlashCardLinks } from './flashcard-links';
import { withHistory } from 'slate-history';
import { withLinks } from './links';
import { withReact } from 'slate-react';
import { withShortcuts } from './shortcuts';
import './editor.scss';

interface ExtendedReactEditor extends ReactEditor {
  saveSelectionOnBlur?: () => void;
  blurSelection?: BaseSelection;
}

// When focus is lost, save a copy of what the editor has selected
function withSaveSelectionOnBlur(editor: ExtendedReactEditor) {
  editor.saveSelectionOnBlur = () => {
    editor.blurSelection = editor.selection;
  }

  return editor;
}

export function createFullEditor() {
  // @ts-ignore
  return withFlashCardLinks(withSaveSelectionOnBlur(withShortcuts(withLinks(withHistory(withReact(createEditor()))))));
}

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+=': 'math_inline',
};
const LIST_TYPES = ['numbered-list', 'bulleted-list'];

interface FullEditorProps {
  editor: ExtendedReactEditor;
  readOnly?: boolean;
  styleOptions?: {
    minHeight?: string; /**E.g., 200px */
    showBorder?: boolean;
  };
  id?: string;
}
export function FullEditor(props: FullEditorProps) {
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

export const toggleBlock = (editor: ReactEditor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      // @ts-ignore
      LIST_TYPES.includes(n.type as string),
    split: true,
  });

  Transforms.setNodes(editor, {
    // @ts-ignore
    type: isActive ? 'paragraph' : (isList ? 'list-item' : format),
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
}

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
}

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    // @ts-ignore
    match: n => n.type === format,
  });

  return !!match;
}

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}
