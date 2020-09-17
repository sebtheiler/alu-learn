import React, {useMemo, useState, useEffect} from 'react';
import {Slate} from 'slate-react';
import {errorHandler, useInterval} from '../../utils';
import {Button} from 'react-bootstrap';
import {apiNoteDelete, apiNoteDetail, apiNoteUpdate} from '../../lookup';
import {DeleteModal} from '../buttons';
import {createFullEditor, EditorButtons, FullEditor} from '../editor';

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
    () => createFullEditor(),
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
          <EditorButtons
            editor={editor}
            saveHandler={(event) => {
              event.preventDefault();
              sendSaveApiRequest();
            }}
          />
          <hr />
          <FullEditor
            editor={editor}
            readOnly={!noteDidSet}
            didTypeCallback={() => {
              setDidTypeRecently(true);
              setAreChanges(true);
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
        hide={() => setShowDeleteModal(false)}
        note={note}
        deleteApiFunction={apiNoteDelete}
      />
    </div>
  );
};
