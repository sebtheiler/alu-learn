import React, { useState } from 'react';
import { Button, ButtonGroup, Form, FormControl, InputGroup, Modal } from 'react-bootstrap';
import { apiHabitCreate, apiHabitDelete, apiHabitRearrange, apiRoutineCreate, apiRoutineDelete, apiRoutineRearrange } from '../lookup';
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
    apiHabitCreate(
      routineId,
      form.elements.title.value,
      '', '', '', '', '',
      'NEUTRAL',
      (response, status) => {
        if (status === 201) {
          form.elements.title.value = '';
          createHabitCallback(response);
        } else {
          errorHandler(response, status, 9002);
        }
      },
    );
  }

  return (
    <Form onSubmit={createHabit}>
      <InputGroup className='mb-3 mx-auto' style={{ maxWidth: '500px' }}>
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


interface HabitButtonGroupProps {
  routine: Routine;
  habit: Habit;
  deleteHabitCallback(habitId: number): void;
  rearrangeHabitCallback(habitId: number, direction: 'UP' | 'DOWN'): void;
}
export function HabitButtonGroup(props: HabitButtonGroupProps) {
  const { routine, habit, deleteHabitCallback, rearrangeHabitCallback } = props;

  const deleteHabit = event => {
    event.preventDefault();
    if (!window.confirm('Are you sure you want to delete this habit?')) return;
    apiHabitDelete(routine.id, habit.id, (response, status) => {
      if (status === 200) {
        deleteHabitCallback(habit.id);
      } else {
        errorHandler(response, status, 9005);
      }
    });
  }

  const rearrangeHabit = (direction: 'UP' | 'DOWN') => {
    return event => {
      apiHabitRearrange(routine.id, habit.id, direction, (response, status) => {
        if (status === 200) {
          rearrangeHabitCallback(habit.id, direction);
        } else {
          errorHandler(response, status, 9008);
        }
      });
    }
  }

  return (
    <ButtonGroup
      className='float-right'
    >
      {habit.habit_num > 0 && <Button
        variant='secondary'
        onClick={rearrangeHabit('UP')}
        className='mr-1'
      >
        Move Up
      </Button>}
      {habit.habit_num < routine.habits.length - 1 && <Button
        variant='secondary'
        onClick={rearrangeHabit('DOWN')}
        className='mr-1'
      >
        Move Down
      </Button>}
      <Button
        variant='danger'
        onClick={deleteHabit}
      >
        Delete
      </Button>
    </ButtonGroup>
  );
}

interface RoutineButtonGroupProps {
  routine: Routine;
  numRoutines: number;
  deleteRoutineCallback(routineId: number): void;
  rearrangeRoutineCallback(routineId: number, direction: 'UP' | 'DOWN'): void;
}
export function RoutineButtonGroup(props: RoutineButtonGroupProps) {
  const { routine, numRoutines, deleteRoutineCallback, rearrangeRoutineCallback } = props;

  const deleteRoutine = event => {
    event.preventDefault();
    if (window.prompt('Are you sure you want to delete this routine?  This action is permanent and irreversible.  Please type "DELETE" if you want to proceed.') !== 'DELETE')
      return;

    apiRoutineDelete(routine.id, (response, status) => {
      if (status === 200) {
        deleteRoutineCallback(routine.id);
      } else {
        errorHandler(response, status, 9006);
      }
    });
  }

  const rearrangeRoutine = (direction: 'UP' | 'DOWN') => {
    return event => {
      event.preventDefault();
      apiRoutineRearrange(routine.id, direction, (response, status) => {
        if (status === 200) {
          rearrangeRoutineCallback(routine.id, direction);
        } else {
          errorHandler(response, status, 9007);
        }
      });
    }
  }

  return (
    <ButtonGroup className='float-right'>
      {routine.routine_num > 0 && <Button
        onClick={rearrangeRoutine('UP')}
        className='mr-1'
      >
        Move Up
      </Button>}
      {routine.routine_num < numRoutines - 1 && <Button
        onClick={rearrangeRoutine('DOWN')}
        className='mr-1'
      >
        Move Down
      </Button>}
      <Button
        variant='danger'
        onClick={deleteRoutine}
      >
        Delete Routine
      </Button>
    </ButtonGroup>
  );
}
