import React, {useEffect, useState} from 'react';
import {errorHandler, useInterval} from '../utils';
import {Button} from 'react-bootstrap';
import {apiNoteDelete, apiNoteDetail, apiNoteUpdate} from '../lookup';
import {DeleteModal} from './buttons';

import {StandardNoteEditor} from './standard';

export function NoteEditor(props) {
  const {noteId} = props;
  const isViewing = props.isViewing instanceof String ? props.isViewing === 'true' : props.isViewing;

  const [initialValue, setInitialValue] = useState(null);
  const [valueToSave, setValueToSave] = useState(null);
  const [note, setNote] = useState(null);
  const [noteDidSet, setNoteDidSet] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [didTypeRecently, setDidTypeRecently] = useState(false);
  const [areChanges, setAreChanges] = useState(false);
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
          setInitialValue(response.content instanceof String ? JSON.parse(response.content) : response.content);
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
      apiNoteUpdate(noteId, null, JSON.stringify(valueToSave), (response, status) => {
        if (status === 200) {
          window.onbeforeunload = undefined;
        } else {
          // Error updating notes
          errorHandler(response, status, 6001);
        };
      });
    };
  };

  // Auto-save every 5-10 seconds if the user hasn't typed recently
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

  const renderEditor = () => {
    switch (note.serializer_name) {
      case 'note-standard':
        return (
          <StandardNoteEditor
            initialValue={initialValue}
            isViewing={isViewing}
            onChangeCallback={newValue => {
              setValueToSave(newValue);
              window.onbeforeunload = confirmExit;
            }}
            saveHandler={event => {
              event.preventDefault();
              sendSaveApiRequest();
            }}
            didTypeCallback={() => {
              setDidTypeRecently(true);
              setAreChanges(true);
            }}
          />
        );
      default:
        return <p>This note type isn't recognized.</p>;
    };
  };

  return (
    <div className='container mt-5'>
      {isViewing ? <>
        <h1>Studying "{note ? note.title : 'Loading...'}"</h1>
        <Button href={`/notes/edit/${noteId}/`}>
          Edit
        </Button>
      </> : <>
        <h1>Taking Notes in "{note ? note.title : 'Loading...'}"</h1>
        <p className='text-secondary'>
          {areChanges ? 'Saving...' : 'Saved'}
        </p>
        <Button href={`/notes/study/${noteId}/`} className='mb-3'>
          Study
        </Button>
      </>}
      {initialValue ? <div id='note-editor'>
        {renderEditor()}
      </div> : <p>Loading...</p>}
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
