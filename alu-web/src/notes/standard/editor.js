import React, {useCallback, useMemo, useState, useEffect} from 'react';
import {createEditor, Editor, Transforms, Range} from 'slate';
import {Slate, Editable, withReact, useSlate, useFocused, useSelected} from 'slate-react';
import {withHistory} from 'slate-history';
import {errorHandler, useInterval} from '../../utils';
import {Button, ButtonGroup, OverlayTrigger, Tooltip} from 'react-bootstrap';
import isHotKey from 'is-hotkey';
import isUrl from 'is-url'
import {apiNoteDelete, apiNoteDetail, apiNoteUpdate} from '../../lookup';
import {DeleteModal} from '../buttons';
import imageExtensions from 'image-extensions';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+5': 'strikethrough',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];


export function StandardNoteEditor(props) {
  const {noteId} = props;
  
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{text: 'Loading your notes...'}],
    },
  ]);
  const [note, setNote] = useState(null);
  const [noteDidSet, setNoteDidSet] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [didTypeRecently, setDidTypeRecently] = useState(false);
  const [areChanges, setAreChanges] = useState(false);
  const editor = useMemo(
    () => withImages(withLinks(withHistory(withReact(createEditor())))),
    []
  );
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function confirmExit() {
    if (!areChanges) {
      return 'This page is asking you to confirm that you want to leave - data you have entered may not be saved.';
    };
  };
  // Get note data
  useEffect(() => {
    if (noteDidSet === false) {
      setNoteDidSet(true);
      apiNoteDetail(noteId, (response, status) => {
        if (status === 200) {
          setNote(response);
          setValue(response.content instanceof String ? JSON.parse(response.content) : response.content);
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

  // Function for sending a request to the API for saving
  const sendSaveApiRequest = () => {
    if (areChanges && noteDidSet) {
      setAreChanges(false);
      apiNoteUpdate(noteId, null, JSON.stringify(value), (response, status) => {
        if (status === 200) {
          window.onbeforeunload = undefined;
        } else {
          // Error updating notes
          errorHandler(response, status, 6001);
        };
      });
    };
  };

  // Auto-save every 5-10 seconds
  useInterval(() => {
    if (didTypeRecently) {
      setDidTypeRecently(false);
    } else {
      sendSaveApiRequest();
    };
  }, areChanges ? 5000 : null);

  if (notFound) {
    return <p className='text-center'>Note not found</p>
  };

  return (
    <div className='container mt-5'>
      <h1>Taking Notes in "{note ? note.title : 'Loading...'}"</h1>
      <p className='text-secondary'>
        {areChanges ? 'Saving...' : 'Saved'}
      </p>
      <Button href={`/notes/study/${noteId}/`} className='mb-3'>
        Study
      </Button>
      <div id='note-text-editor'>
        <Slate
          editor={editor}
          value={value}
          onChange={newValue => {
            // There have been changes now
            setValue(newValue);
            window.onbeforeunload = confirmExit;
          }}
        >
          <ButtonGroup style={{flexWrap: 'wrap'}}>
            <MarkButton format='bold' label='Bold' />
            <MarkButton format='italic' label='Italic' />
            <MarkButton format='underline' label='Underline' />
            <MarkButton format='strikethrough' label='Strikethrough' />
            <MarkButton format='code' label='Code' />
            <LinkButton />
            <ImageButton />
            <span className='mx-1' />
            <BlockButton format='heading-one' label='H1' />
            <BlockButton format='heading-two' label='H2' />
            {/* <BlockButton format='block-quote' label='Quote' /> */}
            <BlockButton format='numbered-list' label='OL' />
            <BlockButton format='bulleted-list' label='UL' />
            <span className='mx-1' />
            <Button
              variant='outline-primary'
              onClick={() => editor.undo()}
            >
              Undo
            </Button>
            <Button
              variant='outline-primary'
              onClick={() => editor.redo()}
            >
              Redo
            </Button>
            <span className='mx-1' />
            <Button
              variant='outline-primary'
              onClick={(event) => {
                event.preventDefault();
                sendSaveApiRequest();
              }}
            >
              Save
            </Button>
          </ButtonGroup>
          <hr />
          <Editable
            readOnly={!noteDidSet}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onKeyDown={event => {
              const modifierKeys = ['Control', 'Alt', 'Shift', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'ScrollLock', 'CapsLock', 'NumLock'];
              if (!modifierKeys.includes(event.key)) {
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
              overflowY: 'auto',
              lineHeight: 1.6,
            }}
          />
        </Slate>
      </div>
      <Button
        variant='danger'
        onClick={event => {event.preventDefault(); setShowDeleteModal(true)}}
        className='mt-3'
      >
        Delete
      </Button>
      <DeleteModal
        show={showDeleteModal}
        hide={event => setShowDeleteModal(false)}
        note={note}
        deleteApiFunction={apiNoteDelete}
      />
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

const withLinks = editor => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === 'link' ? true : isInline(element);
  };

  editor.insertText = text => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    };
  };

  editor.insertData = data => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    };
  };

  return editor;
};

const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url);
  };
};

const isLinkActive = editor => {
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
  return !!link;
};

const unwrapLink = editor => {
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
};

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  };

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  };
};

const LinkButton = () => {
  const editor = useSlate();

  return (
    <Button
      variant='outline-primary'
      onClick={event => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the link:');
        if (!url) return;
        insertLink(editor, url);
      }}
    >
      Hyperlink
    </Button>
  );
};

const withImages = editor => {
  const { insertData, isVoid } = editor;

  editor.isVoid = element => {
    return element.type === 'image' ? true: isVoid(element);
  };

  editor.insertData = data => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split('/');

        if (mime === 'image') {
          reader.addEventListener('load', () => {
            const url = reader.result;
            insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        };
      };
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(text);
    };
  };

  return editor;
};


const isImageUrl = url => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext = new URL(url).pathname.split('.').pop();
  return imageExtensions.includes(ext);
};

const insertImage = (editor, url) => {
  const text = { text: '' };
  const image = { type: 'image', url, children: [text] };
  Transforms.insertNodes(editor, image);
};

const ImageButton = () => {
  const editor = useSlate();

  return (
    <Button
      variant='outline-primary'
      onClick={event => {
        event.preventDefault();
        const url = window.prompt('Enter the URL of the image:');
        if (!url) return;
        insertImage(editor, url);
      }}
    >
      Image
    </Button>
  );
};

export const Element = (props) => {
  const { attributes, children, element } = props;

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
    case 'link':
      return <LinkElement {...props} />
    case 'image':
      return <ImageElement {...props} />
    default:
      return <p {...attributes}>{children}</p>
  };
};

const LinkElement = ({ attributes, children, element }) => {
  return (
    <OverlayTrigger
      overlay={
        <Tooltip className={'button-tooltip text-center'}>
          <a href={element.url} style={{ color: 'white' }}>
            {element.url.length > 50 ? element.url.substring(0, 15) + '   ...   ' + element.url.substring(element.url.length - 10, element.url.length) : element.url}
          </a>
        </Tooltip>
      }
      placement='top'
      delay={{ show: 20, hide: 550 }}
    >
      <a {...attributes} href={element.url}>
        {children}
      </a>
    </OverlayTrigger>
  );
};

const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img
          src={element.url}
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '20em',
            boxShadow: `${selected && focused ? '0 0 0 3px #B4D5FF' : 'none'}`,
          }}
          alt=''
        />
      </div>
      {children}
    </div>
  );
};

export const Leaf = ({ attributes, children, leaf }) => {
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

  if (leaf.strikethrough) {
    children = <del>{children}</del>
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