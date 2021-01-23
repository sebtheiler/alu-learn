import React, { useState } from 'react';
import { Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import { apiClassroomCreate, apiClassroomDelete, apiClassroomEdit } from '../lookup';
import { errorHandler } from '../utils';


export function ClassroomDefaultButtonGroup({ classroom }) {
  return (
    <ButtonGroup>
      <ClassroomEditCreateButton classroom={classroom} />
      <Button href={`/classrooms/${classroom.id}/`} className='ml-1'>View</Button>
    </ButtonGroup>
  );
}


export function ClassroomEditCreateButton({ classroom }) {
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();
    const form = event.target;

    if (classroom) {
      // Edit the classroom
      if (form.elements.title.value === classroom.title) return;

      apiClassroomEdit(classroom.id, form.elements.title.value, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error editing classroom
          errorHandler(response, status, 8001);
        }
      });
    } else {
      // Create a new classroom
      apiClassroomCreate(form.elements.title.value, (response, status) => {
        if (status === 201) {
          window.location.reload();
        } else {
          // Error creating classroom
          errorHandler(response, status, 8002);
        }
      });
    }
  }

  const deleteHandler = () => {
    if (window.prompt(`
Are you sure you want to delete this classroom?  This action is instant and irreversible.
If you wish to continue, please type "DELETE", without the quotes.
    `) === 'DELETE') {
      apiClassroomDelete(classroom.id, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error deleting classroom
          errorHandler(response, status, 8003);
        }
      })
    }
  }

  return (<>
    <Button onClick={() => setEditModalIsOpen(true)}>{classroom ? 'Edit' : 'Create Classroom'}</Button>
    <Modal show={editModalIsOpen} onHide={() => setEditModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>{classroom ? `Editing "${classroom.title}"` : 'Creating'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor='title'>Title</Form.Label>
            <Form.Control
              type='text'
              placeholder='My classroom'
              name='title'
              defaultValue={classroom?.title}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {classroom &&
            <Button onClick={deleteHandler} variant='danger' className='mr-auto'>
              Delete "{classroom.title}"
            </Button>
          }
          <Button onClick={() => setEditModalIsOpen(false)} variant='secondary'>Cancel</Button>
          <Button type='submit' className='ml-1'>
            {classroom ? 'Save' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  </>);
}