import React, {useCallback, useMemo, useState, useEffect} from 'react';
import {createEditor, Editor, Transforms} from 'slate';
import {Slate, Editable, withReact, useSlate} from 'slate-react';
import {errorHandler, useInterval} from '../../utils';
import {Button, ButtonGroup} from 'react-bootstrap';
import isHotKey from 'is-hotkey';
import {apiNoteDetail, apiNoteUpdate} from '../../lookup';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

function confirmExit() {
    return 'This page is asking you to confirm that you want to leave - data you have entered may not be saved.';
};

export function StandardNoteEditor(props) {
  const {noteId} = props;

  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{text: 'A line of text in a paragraph'}],
    },
  ]);
  const [note, setNote] = useState(null);
  const [noteDidSet, setNoteDidSet] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [didTypeRecently, setDidTypeRecently] = useState(false);
  const [areChanges, setAreChanges] = useState(false);
  const editor = useMemo(() => withReact(createEditor()), []);

  useEffect(() => {
    if (noteDidSet === false) {
      setNoteDidSet(true);
      apiNoteDetail(noteId, (response, status) => {
        if (status === 200) {
          setNote(response);
          setValue(JSON.parse(response.content));
        } else if (status === 404) {
          setNotFound(true);
        } else {
          // Error getting note detail
          errorHandler(response, status, 6000);
        };
      });
    };
  }, [note, noteDidSet, noteId]);

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  useInterval(() => {
    if (didTypeRecently) {
      setDidTypeRecently(false);
    } else {
      setAreChanges(false);
      console.log('sending API request');
      apiNoteUpdate(noteId, null, JSON.stringify(value), (response, status) => {
        if (status === 200) {
          window.onbeforeunload = undefined;
        } else {
          // Error updating notes
          errorHandler(response, status, 6001);
        };
      });
    };
  }, areChanges ? 5000 : null);

  if (notFound) {
    return <p className='text-center'>Note not found</p>
  };

  return (
    <div className='container'>
      <h1>Taking Notes</h1>
      <p className='text-secondary'>
        {areChanges ? 'Saving...' : 'Saved'}
      </p>
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => {
          setValue(newValue);
          window.onbeforeunload = confirmExit;
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
          {/* <BlockButton format='block-quote' label='Quote' /> */}
          <BlockButton format='numbered-list' label='OL' />
          <BlockButton format='bulleted-list' label='UL' />
        </ButtonGroup>
        <hr />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            if (event.key !== 'Control' && event.key !== 'Alt' && event.key !== 'Shift') {
              setDidTypeRecently(true);
              setAreChanges(true);
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
            borderStyle: 'dashed',
            borderWidth: '1px',
            padding: '20px',
            minHeight: '500px',
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