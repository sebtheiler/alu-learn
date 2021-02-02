import React, { useState } from 'react';
import { Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import { apiClassroomCreate, apiClassroomDelete, apiClassroomEdit, apiClassroomSuspendFlashCards } from '../lookup';
import { errorHandler, LoadingButton } from '../utils';


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
        <Modal.Title>{classroom ? `Editing "${classroom.title}"` : 'Creating a Class'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor='title'>Title</Form.Label>
            <Form.Control
              type='text'
              placeholder='My class'
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

export function SuspendStudentFlashcardsButton({ classroomId, className }) {
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState('SUSPEND');
  const [numSuspended, setNumSuspended] = useState();

  const suspendStudentFlashcardsButton = event => {
    event.preventDefault();
    const form = event.target;

    apiClassroomSuspendFlashCards(classroomId, form.elements.tagQuery.value, action, (response, status) => {
      if (status === 200) {
        setNumSuspended(response.count);
      } else {
        errorHandler(response, status, 8014);
      }
    });
  }

  return (<>
    <Button onClick={() => setShowModal(true)} className={className}>
      Suspend Student Flashcards
    </Button>
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header>
        <Modal.Title>Suspend Student Flashcards</Modal.Title>
      </Modal.Header>
      {numSuspended !== undefined ? <>
        <Modal.Body>
          <p>
            Successfully {action === 'SUSPEND' ? 'suspended' : 'unsuspended'}{' '}
            {numSuspended} of your students' flashcards.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowModal(false)} variant='secondary' block>
            Close
          </Button>
        </Modal.Footer>
      </> : <>
        <Form onSubmit={suspendStudentFlashcardsButton}>
          <Modal.Body>
            <p>
              Suspend specific flashcards in students' decks.{' '}
              You can use this to assign certain units to students.
            </p>
            <Form.Group>
              <Form.Label>
                Tag Query<br />
                <small className='text-muted'>
                  You can use logical operators like AND, OR, and NOT<br />
                  (e.g.: NOT unit 1 OR NOT essential)
                </small>
              </Form.Label>
              <Form.Control
                type='text'
                name='tagQuery'
                required
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                Action<br/>
                <small className='text-muted'>
                  Whether to suspend the searched flashcards, or unsuspend them.
                </small>
              </Form.Label>
              <Form.Control
                as='select'
                name='action'
                onChange={event => setAction(event.target.value)}
                custom
              >
                <option value='SUSPEND'>Suspend Flashcards</option>
                <option value='UNSUSPEND'>Unsuspend Flashcards</option>
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowModal(false)} variant='secondary' className='mr-auto'>
              Cancel
            </Button>
            <LoadingButton loadingMessage='Loading...' type='submit'>
              {action === 'SUSPEND' ? 'Suspend Flashcards' : 'Unsuspend Flashcards'}
            </LoadingButton>
          </Modal.Footer>
        </Form>
      </>}
    </Modal>
  </>);
}
