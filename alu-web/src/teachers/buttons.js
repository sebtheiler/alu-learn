import React, { useState } from 'react';
import { Button, ButtonGroup, Form, Modal } from 'react-bootstrap';


export function ClassroomDefaultButtonGroup(props) {
  const {classroom} = props;
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);

  const handleEditClassroom = event => {
    event.preventDefault();
  }

  return (
    <ButtonGroup>
      <Button onClick={() => setEditModalIsOpen(true)}>Edit</Button>
      <Modal show={editModalIsOpen} onHide={() => setEditModalIsOpen(false)}>
        <Modal.Header>
          <Modal.Title>Editing "{classroom.title}"</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditClassroom}>
          <Modal.Body>
            <Form.Group>
              <Form.Label htmlFor='title'>Title</Form.Label>
              <Form.Control
                type='text'
                placeholder='My classroom'
                name='title'
                defaultValue={classroom.title}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Form.Group>
              <ButtonGroup>
                <Button onClick={() => setEditModalIsOpen(false)} variant='secondary'>Cancel</Button>
                <Button type='submit' className='ml-1'>Save</Button>
              </ButtonGroup>
            </Form.Group>
          </Modal.Footer>
        </Form>
      </Modal>
      <Button href={`/classrooms/${classroom.id}/`} className='ml-1'>View</Button>
    </ButtonGroup>
  )
}