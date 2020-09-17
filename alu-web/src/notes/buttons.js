import React, {useState} from 'react';
import {Button, ButtonGroup, Form, Modal} from 'react-bootstrap';
import { apiNoteCreate } from '../lookup';
import { errorHandler } from '../utils';

export function NoteDefaultButtonGroup(props) {
  const {note} = props;

  return (
    <ButtonGroup>
      <Button href={`/notes/edit/${note.id}/`} className='mr-1'>
        Edit
      </Button>
      <Button href={`/notes/study/${note.id}/`} className='mr-1'>
        Study
      </Button>
    </ButtonGroup>
  );
};

export function NoteCreateButton(props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const submitHandler = (event) => {
    event.preventDefault();
    const form = event.target;

    apiNoteCreate(form.elements.title.value, form.elements.type.value, (response, status) => {
      if (status === 201) {
        window.location.reload();
      } else {
        // Error creating note
        errorHandler(response, status, 6004);
      };
    });
  };

  return (<>
    <Button
      className='ml-1'
      onClick={() => {setModalIsOpen(true)}}
    >
      Create new Note
    </Button>
    <NoteCreateModal
      show={modalIsOpen}
      hide={() => setModalIsOpen(false)}
      submitHandler={submitHandler}  
    />
  </>);
};

export function NoteCreateModal(props) {
  const {show, hide, submitHandler} = props;

  return (
    <Modal show={show} onHide={hide}>
      <Modal.Header>
        <Modal.Title>
          Creating new Note
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={submitHandler}>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor='title'>Title</Form.Label>
            <Form.Control
              type='text'
              placeholder='My AP Biology Notes'
              name='title'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='type'>
              Type of notes <br />
              <small className='text-secondary'>
                (This cannot be changed after the note is created)
              </small>
            </Form.Label>
            <br />
            <Form.Control as='select' name='type' custom>
              <option value='STND'>Standard</option>
              <option value='CORN'>Cornell</option>
              <option value='FREE' disabled>Freeform</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={hide}>Cancel</Button>
          <Button type='submit'>Create</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};