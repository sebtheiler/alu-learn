import React, { useCallback } from 'react';
import { Editor, Transforms } from 'slate';
import { Editable, ReactEditor } from 'slate-react';
import isHotKey from 'is-hotkey';
import './editor.css';

import { Element, Leaf } from './renderer';

import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withLinks } from './links';
import { withImages } from './images';

export function createFullEditor() {
  return withImages(withLinks(withHistory(withReact(createEditor()))));
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
  editor: ReactEditor;
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
    />
  );
}

export const toggleBlock = (editor: ReactEditor, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type as string),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
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
    match: n => n.type === format,
  });

  return !!match;
}

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
}