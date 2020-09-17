import React, {useMemo, useState, useEffect, useCallback} from 'react';
import {createEditor} from 'slate';
import {Slate, Editable, withReact} from 'slate-react';
import {errorHandler} from '../../utils';
import {Button} from 'react-bootstrap';
import {apiNoteDetail} from '../../lookup';
import {Element, Leaf} from './editor';

export function StandardNoteViewer(props) {
  const {noteId} = props;
  const [note, setNote] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [noteDidSet, setNoteDidSet] = useState(false);
  const [value, setValue] = useState([
    {
      type: 'paragraph',
      children: [{text: 'Loading your notes...'}],
    },
  ]);
  const editor = useMemo(() => withReact(createEditor()), []);

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
          errorHandler(response, status, 6003);
        };
      });
    };
  }, [noteId, note, noteDidSet]);

  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);

  if (notFound) {
    return <p className='text-center'>Note not found</p>
  };

  return (
    <div className='container mt-5'>
      <h1>Studying "{note ? note.title : 'Loading...'}"</h1>
      <Button href={`/notes/edit/${noteId}/`}>Edit</Button>
      <hr />
      <Slate editor={editor} value={value} onChange={value => setValue(value)}>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          readOnly
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
  );
};