import React, { useEffect, useState } from 'react';
import { errorHandler, useInterval } from '../utils';
import { Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import { apiNoteDelete, apiNoteDetail, apiNotePageUpdate, apiCreateNewNotePage, apiDeleteNotePage, apiNotePageDetail } from '../lookup';
import { DeleteModal } from './buttons';
import { StandardNoteEditor } from './standard';
import { CornellNoteEditor } from './cornell';
import './editor.css';


export function NoteEditor(props) {
  const {noteId, pageNum} = props;
  const isViewing = props.isViewing instanceof String ? props.isViewing === 'true' : props.isViewing;

  const [valueToSave, setValueToSave] = useState(null);
  const [note, setNote] = useState(null);
  const [page, setPage] = useState(null);
  const [noteDidSet, setNoteDidSet] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [didTypeRecently, setDidTypeRecently] = useState(false);
  const [areChanges, setAreChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [createNewPageModalIsOpen, setCreateNewPageModalIsOpen] = useState(false);

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

      // Get the specific page's data
      apiNotePageDetail(noteId, pageNum, (response, status) => {
        if (status === 200) {
          setPage(response);
        } else if (status !== 404) { // just wait for the request above to 404
          // Error getting note page detail
          errorHandler(response, status, 6008);
        }
      });
    }
  }, [note, noteDidSet, noteId, pageNum]);

  // Function for sending a request to the API for saving
  const sendSaveApiRequest = (callback) => {
    if (areChanges && noteDidSet) {
      apiNotePageUpdate(noteId, page.id, JSON.stringify(valueToSave), (response, status) => {
        if (status === 200) {
          window.onbeforeunload = undefined;
          setAreChanges(false);
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
    const form = event.target;

    const pagePositionConversion = {
      END: 'END',
      FRONT: 'FRONT',
      AFTER: parseInt(pageNum) + 1,
      BEFORE: parseInt(pageNum),
    };

    apiCreateNewNotePage(
      form.elements.title.value,
      parseInt(noteId),
      form.elements.pageType.value,
      pagePositionConversion[form.elements.pagePosition.value],
      (response, status) => {
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
    apiDeleteNotePage(parseInt(noteId), page.id, (response, status) => {
      if (status === 200) {
        const newPageNumber = Math.max(parseInt(pageNum) - 1, 1);
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
      return <p className='text-center'>Loading...</p>
    }

    const editorProps = {
      initialValue: page,
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
      pageNum: pageNum,
    };

    if (note.pages.length === 0) {
      return <p className='text-center'>You don't have any pages yet</p>
    }

    switch (page.note_page_type) {
      case 'STND':
        return <StandardNoteEditor {...editorProps} />
      case 'CORN':
        return <CornellNoteEditor {...editorProps} />
      default:
        return <p>This note type, "{page.note_page_type}", isn't recognized.</p>;
    }
  }

  if (!(note && page)) {
    return <>Loading...</>
  }

  return (
    <div className='container mt-5'>
      {isViewing ? <>
        <h1>Studying "{note ? note.title : 'Loading...'}"</h1>
        <Button href={`/notes/edit/${noteId}/`} className='mb-3'>
          Edit
        </Button>
      </> : <>
        <Form.Label as='h4'>Note Title</Form.Label>
        <Form.Control
          type='text'
          style={{ fontSize: '20px' }}
          placeholder='Untitled...'
          className='mb-3'
          defaultValue={note.title}
          maxLength='128'
          onChange={event => {
            event.preventDefault();
            setValueToSave({...valueToSave, note_title: event.target.value});
            setDidTypeRecently(true);
            setAreChanges(true);
          }}
        />
        {note?.pages?.length > 0 && <>
          <Form.Label as='h6'>Page Title</Form.Label>
          <Form.Control
            type='text'
            style={{ fontSize: '14px' }}
            placeholder='Untitled...'
            className='mb-3'
            defaultValue={page ? page.title : 'Loading...'}
            maxLength='128'
            onChange={event => {
              event.preventDefault();
              setValueToSave({...valueToSave, page_title: event.target.value});
              setDidTypeRecently(true);
              setAreChanges(true);
            }}
          />
        </>}
        <hr />
        <p className='text-secondary'>
          {areChanges ? 'Saving...' : 'Saved'}
        </p>
        <Button href={`/notes/study/${noteId}/`} className='mb-3'>
          View
        </Button><br />
      </>}
      {note && page && renderEditor()}
      <h3 className='text-center mt-3'>Page Browser</h3>
      <div className='text-center'>
        <ButtonGroup>
          <Button onClick={() => setCreateNewPageModalIsOpen(true)}>
            Create New Page
          </Button>
          <Modal show={createNewPageModalIsOpen} onHide={() => setCreateNewPageModalIsOpen(false)}>
            <Modal.Header>
              <Modal.Title>
                Creating New Page
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={createNewPage}>
              <Modal.Body>
                <Form.Group>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='New Page'
                    name='title'
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Type of Page</Form.Label>
                  <Form.Control
                    as='select'
                    name='pageType'
                    custom
                  >
                    <option value='STND'>Freeform/Standard Notes</option>
                    <option value='CORN'>Cornell Notes</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Page Position</Form.Label>
                  <Form.Control
                    as='select'
                    name='pagePosition'
                    custom
                  >
                    <option value='END'>At the end of all pages</option>
                    <option value='FRONT'>At the beginning of all pages</option>
                    <option value='AFTER'>After the current page</option>
                    <option value='BEFORE'>Before the current page</option>
                  </Form.Control>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button type='submit'>Create Page</Button>
              </Modal.Footer>
            </Form>
          </Modal>
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
          <PageBrowserCard
            key={index}
            index={index}
            page={page}
            note={note}
            pageNum={pageNum}
            sendSaveApiRequest={sendSaveApiRequest}
          />
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

function PageBrowserCard(props) {
  const {page, index, note, sendSaveApiRequest, pageNum} = props;

  return (
    <a
      href={`/notes/edit/${note.id}/page/${index + 1}/`}
      style={{
        height: '100%', weight: '100%',
        display: 'inline-block',
        color: 'black',
      }}
      onClick={(event => {
        // Stop the link from immediately working, to first save the document
        // and then redirect the user regularly
        event.preventDefault();
        if (parseInt(pageNum) === index + 1) return;

        sendSaveApiRequest(() => {
          window.location.href = `/notes/edit/${note.id}/page/${index + 1}/`;
        });
      })}
    >
      <div
        style={{
          display: 'inline-block',
          marginBottom: '0',
          position: 'relative',
          overflow: 'hidden',
        }}
        className={'page-selector mx-3 p-3 my-3' + (parseInt(pageNum) === index + 1 ? ' selected' : '')}
      >
        <strong
          className='text-center text-break'
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'initial',
          }}
        >
          {page.title}
        </strong>
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
  );
}