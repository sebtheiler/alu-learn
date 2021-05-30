import React, { useState } from 'react';
import { Button, Form, FormControl, InputGroup, Modal } from 'react-bootstrap';
import { apiHabitCreate, apiHabitDelete, apiRoutineCreate } from '../lookup';
import { errorHandler } from '../utils';
import { Routine, Habit } from './types';


interface CreateRoutineButtonProps {
  createRoutineCallback(newRoutine: Routine): void,
  className?: string,
}
export function CreateRoutineButton(props: CreateRoutineButtonProps) {
  const { createRoutineCallback, className } = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const createRoutine = event => {
    event.preventDefault();
    const form = event.target;
    apiRoutineCreate(form.elements.title.value, true, (response, status) => {
      if (status === 201) {
        createRoutineCallback(response);
        setModalIsOpen(false);
      } else {
        errorHandler(response, status, 9000);
      }
    });
  }

  return (<>
    <Button
      onClick={() => setModalIsOpen(true)}
      className={className}
    >
      Create Routine
    </Button>
    <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>
          Creating Routine
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={createRoutine}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Routine Name</Form.Label>
            <Form.Control
              type='text'
              placeholder='My Routine'
              name='title'
              maxLength={64}
              required
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button type='submit' block>
            Create
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  </>);
}

interface CreateHabitButtonProps {
  createHabitCallback(newHabit: Habit): void,
  routineId: number,
}
export function CreateHabitButton(props: CreateHabitButtonProps) {
  const { createHabitCallback, routineId } = props;

  const createHabit = event => {
    event.preventDefault();
    const form = event.target;
    apiHabitCreate(routineId, form.elements.title.value, '', '', '', '', 'NEUTRAL', (response, status) => {
      if (status === 201) {
        form.elements.title.value = '';
        createHabitCallback(response);
      } else {
        errorHandler(response, status, 9002);
      }
    });
  }

  return (
    <Form onSubmit={createHabit}>
      <InputGroup className='mb-3' style={{ maxWidth: '500px' }}>
        <FormControl
          placeholder='New habit'
          aria-label='New habit'
          name='title'
          required
        />
        <InputGroup.Append>
          <Button variant='primary' type='submit'>
            Create Habit
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  );
}


interface DeleteHabitButtonProps {
  routineId: number;
  habitId: number;
  deleteHabitCallback(habitId: number): void;
}
export function DeleteHabitButton(props: DeleteHabitButtonProps) {
  const { routineId, habitId, deleteHabitCallback } = props;

  const deleteHabit = event => {
    event.preventDefault();
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    apiHabitDelete(routineId, habitId, (response, status) => {
      if (status === 200) {
        deleteHabitCallback(habitId);
      } else {
        errorHandler(response, status, 9005);
      }
    })
  }

  return (
    <Button
      variant='danger'
      className='float-right'
      onClick={deleteHabit}
    >
      Delete
    </Button>
  );
}