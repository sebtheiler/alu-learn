import React, {useCallback} from 'react';
import {Editor, Transforms} from 'slate';
import {Editable} from 'slate-react';
import isHotKey from 'is-hotkey';

import {Element, Leaf} from './renderer';

import {createEditor} from 'slate';
import {withReact} from 'slate-react';
import {withHistory} from 'slate-history';
import {withLinks} from './links';
import {withImages} from './images';

export function createFullEditor() {
  return withImages(withLinks(withHistory(withReact(createEditor()))));
};

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+5': 'strikethrough',
};
const LIST_TYPES = ['numbered-list', 'bulleted-list'];

export function FullEditor(props) {
  const {editor, didTypeCallback, readOnly, styleOptions} = props;
  const {minHeight, showBorder} = styleOptions ? styleOptions : { showBorder: true };

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  return (
    <Editable
      readOnly={readOnly}
      renderElement={renderElement}
      renderLeaf={renderLeaf}
      onKeyDown={event => {
        const modifierKeys = ['Control', 'Alt', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'ScrollLock', 'CapsLock', 'NumLock'];
        if (didTypeCallback && !modifierKeys.includes(event.key)) {
          didTypeCallback();
        };

        for (const hotkey in HOTKEYS) {
          if (isHotKey(hotkey, event)) {
            event.preventDefault();
            const mark = HOTKEYS[hotkey];
            toggleMark(editor, mark);
          };
        };
      }}
      style={{
        borderStyle: showBorder ? 'solid' : 'none',
        borderWidth: '1px',
        padding: '20px',
        minHeight: minHeight ? minHeight : '600px',
        overflowY: 'auto',
        lineHeight: 1.6,
      }}
    />
  );
};

export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true,
  });

  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  };
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  };
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};