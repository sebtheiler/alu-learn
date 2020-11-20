import React, { useEffect, useState } from 'react';
import { errorHandler, useInterval } from '../utils';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import { apiNoteDelete, apiNoteDetail, apiNoteUpdate, apiCreateNewNotePage, apiDeleteNotePage } from '../lookup';
import { DeleteModal } from './buttons';
import { StandardNoteEditor } from './standard';
import { CornellNoteEditor } from './cornell';
import './editor.css';


export function NoteEditor(props) {
  const {noteId, pageNum} = props;
  const isViewing = props.isViewing instanceof String ? props.isViewing === 'true' : props.isViewing;

  const [valueToSave, setValueToSave] = useState(null);
  const [note, setNote] = useState(null);
  const [noteDidSet, setNoteDidSet] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [didTypeRecently, setDidTypeRecently] = useState(false);
  const [areChanges, setAreChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  function confirmExit() {
    if (areChanges) {
      return 'This page is asking you to confirm that you want to leave - data you have entered may not be saved.';
    }
  }

  // Get note data
  useEffect(() => {
    if (noteDidSet === false) {
      setNoteDidSet(true);
      apiNoteDetail(noteId, true, (response, status) => {
        if (status === 200) {
          setNote(response);
        } else if (status === 404) {
          setNotFound(true);
        } else {
          // Error getting note detail
          errorHandler(response, status, 6000);
        }
      });
    }
  }, [note, noteDidSet, noteId]);

  // Function for sending a request to the API for saving
  const sendSaveApiRequest = (callback) => {
    if (areChanges && noteDidSet) {
      setAreChanges(false);
      apiNoteUpdate(noteId, null, JSON.stringify(valueToSave), (response, status) => {
        if (status === 200) {
          window.onbeforeunload = undefined;
          console.log(callback)
          if (callback) {
            callback();
          }
        } else {
          // Error updating notes
          errorHandler(response, status, 6001);
        }
      });
    } else {
      if (callback) {
        callback();
      }
    }
  }

  // Create a new page
  const createNewPage = (event) => {
    event.preventDefault();
    const pageTitle = window.prompt('Title of the page to create');
    if (!pageTitle) return;
    apiCreateNewNotePage(pageTitle, parseInt(noteId), 'STND', (response, status) => {
      if (status === 201) {
        window.location.href = `/notes/edit/${noteId}/page/${response.page_number}/`;
      } else {
        // Error creating new note page
        errorHandler(response, status, 6006);
      }
    });
  }

  // Delete the current page
  const deletePage = (event) => {
    event.preventDefault();
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    apiDeleteNotePage(parseInt(noteId), parseInt(pageNum), (response, status) => {
      if (status === 200) {
        const newPageNumber = Math.max(response.page_number - 1, 1);
        window.location.href = `/notes/edit/${noteId}/page/${newPageNumber}/`;
      } else {
        // Error deleting note pagae
        errorHandler(response, status, 6007);
      }
    });
  }

  // Auto-save every 5-10 seconds if the user hasn't typed recently
  useInterval(() => {
    if (didTypeRecently) {
      setDidTypeRecently(false);
    } else {
      sendSaveApiRequest();
    }
  }, areChanges ? 5000 : null);

  if (notFound) {
    return <p className='text-center'>Note not found</p>
  }

  const renderEditor = () => {
    if (!note) {
      return (
        <p className='text-center'>Loading...</p>
      );
    }

    const editorProps = {
      initialValue: note.pages[parseInt(pageNum)],
      isViewing: isViewing,
      updateValueToSave: newValue => {
        setValueToSave({...valueToSave, ...newValue});
        window.onbeforeunload = confirmExit;
      },
      saveHandler: event => {
        event.preventDefault();
        sendSaveApiRequest();
      },
      didTypeCallback: () => {
        setDidTypeRecently(true);
        setAreChanges(true);
      },
      noteId: noteId,
    };

    if (note.pages.length === 0) {
      return (
        <p className='text-center'>You don't have any pages yet</p>
      );
    }

    switch (note.pages[parseInt(pageNum)].page.note_page_type) {
      case 'STND':
        return <StandardNoteEditor {...editorProps} />
      case 'CORN':
        return <CornellNoteEditor {...editorProps} />
      default:
        return <p>This note type isn't recognized.</p>;
    }
  }

  return (
    <div className='container mt-5'>
      {isViewing ? <>
        <h1>Studying "{note ? note.title : 'Loading...'}"</h1>
        <Button href={`/notes/edit/${noteId}/`} className='mb-3'>
          Edit
        </Button>
      </> : <>
        <Form.Label as='h4'>Title</Form.Label>
        <Form.Control
          type='text'
          id='titleForm'
          name='titleForm'
          style={{ fontSize: '28px' }}
          placeholder='Untitled...'
          className='mb-3'
          defaultValue={note && note.title}
          onChange={event => {
            event.preventDefault();
            setValueToSave({...valueToSave, title: event.target.value});
            setDidTypeRecently(true);
            setAreChanges(true);
          }}
        />
        <hr />
        <p className='text-secondary'>
          {areChanges ? 'Saving...' : 'Saved'}
        </p>
        <Button href={`/notes/study/${noteId}/`} className='mb-3'>
          View
        </Button>
      </>}
      {renderEditor()}
      <h3 className='text-center'>Page Browser</h3>
      <div className='text-center'>
        <ButtonGroup>
          <Button onClick={createNewPage}>
            Create New Page
          </Button>
          {note && note.pages.length > 0 && <Button
            variant='danger'
            onClick={deletePage}
            className='ml-1'
          >
            Delete Current Page
          </Button>}
        </ButtonGroup>
      </div>
      {note && <div
        className='mx-auto text-center mb-5'
        style={{
          width: '100%',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
        >
        {note.pages && note.pages.map((page, index) => (
          <a
          key={index}
          // TODO: check that the user is not already on the page they clicked to avoid, un-needed reloading
          href={`/notes/edit/${note.id}/page/${index + 1}/`}
          onClick={(event => {
            // Stop the link from immediately working, to first save the document
            // and then redirect the user regularly
            event.preventDefault();
            sendSaveApiRequest(() => {
              window.location.href = `/notes/edit/${note.id}/page/${index + 1}/`;
            });
          })}
          >
            <div className='page-selector mx-3 p-3 my-3'>
              <strong>{page.title}</strong>
              <p
                className='align-text-bottom float-right'
                style={{
                  transform: 'translateY(150px)',
                }}
              >
                {index + 1}
              </p>
            </div>
          </a>
        ))}
      </div>}
      <Button
        variant='danger'
        onClick={event => {event.preventDefault(); setShowDeleteModal(true)}}
        className='mt-3 mb-5'
      >
        Delete Everything
      </Button>
      <DeleteModal
        show={showDeleteModal}
        hide={() => setShowDeleteModal(false)}
        note={note}
        deleteApiFunction={apiNoteDelete}
      />
    </div>
  );
}
