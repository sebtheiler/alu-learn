import React, {useCallback, useMemo, useState} from 'react';
import {createEditor, Editor, Transforms, Text} from 'slate'
import {Slate, Editable, withReact, useSlate} from 'slate-react'
import {Button, ButtonGroup} from 'react-bootstrap';
import isHotKey from 'is-hotkey';

const CustomEditor = {
  isBoldMarkActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor) {
    const [match] = Editor.nodes(editor, {
      match: n => n.type === 'code',
    });

    return !!match;
  },

  toggleBoldMark(editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? null : true },
      { match: n => Text.isText(n), split: true },
    );
  },

  toggleCodeBlock(editor) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? null : 'code' },
      { match: n => Editor.isBlock(editor, n) }
    );
  },
};

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

export function StandardNoteEditor() {
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{text: 'A line of text in a paragraph'}],
    },
  ]);
  const editor = useMemo(() => withReact(createEditor()), []);

  const renderElement = useCallback(props => <Element {...props} />, []);

  const renderLeaf = useCallback(props => {
    return <Leaf {...props} />
  }, []);

  return (
    <div className=''>
      <h1>Taking Notes</h1>
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          setValue(newValue);

          // const content = JSON.stringify(value);
          // console.log(content);
        }}
      >
        <ButtonGroup>
          <MarkButton format='bold' label='Bold' />
          <MarkButton format='italic' label='Italic' />
          <MarkButton format='underline' label='Underline' />
          <MarkButton format='code' label='Code' />
          <span className='mx-1' />
          <BlockButton format='heading-one' label='H1' />
          <BlockButton format='heading-two' label='H2' />
          <BlockButton format='block-quote' label='Quote' />
          <BlockButton format='numbered-list' label='OL' />
          <BlockButton format='bulleted-list' label='UL' />
        </ButtonGroup>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotKey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              };
            };
          }}
        />
      </Slate>
    </div>
  );
};

const toggleBlock = (editor, format) => {
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

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  };
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format,
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    default:
      return <p {...attributes}>{children}</p>
  };
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  };

  if (leaf.code) {
    children = <code>{children}</code>
  };

  if (leaf.italic) {
    children = <em>{children}</em>
  };

  if (leaf.underline) {
    children = <u>{children}</u>
  };

  return <span {...attributes}>{children}</span>
};

const BlockButton = ({ format, label }) => {
  const editor = useSlate();

  return (
    <Button
      variant={isBlockActive(editor, format) ? 'primary' : 'outline-primary'}
      onClick={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >{label}</Button>
  );
};

const MarkButton = ({ format, label }) => {
  const editor = useSlate();

  return (
    <Button
      variant={isMarkActive(editor, format) ? 'primary' : 'outline-primary'}
      onClick={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >{label}</Button>
  );
};