import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { HistoryAction } from '../lookup/lookup';
import { Routine, Habit, EditHabitOptions } from './types';
import { apiHabitCreate, apiHabitDelete, apiHabitRearrange, apiRoutineCreate, apiRoutineDelete, apiRoutineRearrange } from '../lookup';
import { errorHandler, LoadingButton, stringDate } from '../utils';
import { useState, useMemo } from 'react';


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
      id='create-routine-btn'
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
              placeholder='Morning Habits'
              name='title'
              maxLength={64}
              required
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <LoadingButton type='submit' block loadingMessage='Creating...'>
            Create
          </LoadingButton>
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
  const [creatingHabit, setCreatingHabit] = useState(false);

  const createHabit = event => {
    event.preventDefault();
    setCreatingHabit(true);
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
        setCreatingHabit(false);
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
          <Button variant='primary' type='submit' id='create-habit-btn'>
            {creatingHabit ? 'Creating...' : 'Create Habit'}
          </Button>
        </InputGroup.Append>
      </InputGroup>
    </Form>
  );
}


interface HabitTopButtonGroupProps {
  habit: Habit;
  routine: Routine;
  editHabit(options: EditHabitOptions): void;
  rearrangeHabitCallback(habitId: number, direction: 'UP' | 'DOWN'): void;
}
export function HabitTopButtonGroup(props: HabitTopButtonGroupProps) {
  const { habit, routine, editHabit, rearrangeHabitCallback } = props;

  const completedToday = useMemo(() => {
    const sorted = habit.history.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (sorted.length === 0)
      return false;
    if (sorted[0].date === stringDate())
      return true;
    return false;
  }, [habit]);

  const updateHistory = event => {
    let historyAction: HistoryAction;
    const utcTimezoneOffset = new Date().getTimezoneOffset();
    if (completedToday)
      historyAction = {
        action: 'DECREMENT',
        utc_timezone_offset: utcTimezoneOffset,
      }
    else
      historyAction = {
        action: 'INCREMENT',
        utc_timezone_offset: utcTimezoneOffset,
      }
    
    editHabit({ historyAction: historyAction });
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

  return (<div className='float-right'>
    <span
      role='button'
      onClick={updateHistory}
    >
      {habit.value !== 'NEUTRAL' && <OverlayTrigger
        placement='left'
        delay={{ show: 250, hide: 400 }}
        overlay={
          <Tooltip id={`habit-mark-${habit.id}`}>
            {habit.value === 'POSITIVE'
              ? 'Mark this habit as completed for the day'
              : 'Mark this habit as avoided for the day'
            }
          </Tooltip>
        }
      >
        {completedToday ?
          <i className='fas fa-check-circle' />
        :
          <i className='far fa-circle' />
        }
      </OverlayTrigger>}
    </span>
    {habit.habit_num > 0 &&
      <span
        role='button'
        onClick={rearrangeHabit('UP')}
        className='ml-3'
      >
        <i className='fas fa-chevron-up' />
      </span>
    }
    {habit.habit_num < routine.habits.length - 1 &&
      <span
        role='button'
        onClick={rearrangeHabit('DOWN')}
        className='ml-3'
      >
        <i className='fas fa-chevron-down' />
      </span>
    }
  </div>);
}


interface HabitBottomButtonGroupProps {
  routine: Routine;
  habit: Habit;
  deleteHabitCallback(habitId: number): void;
  rearrangeHabitCallback(habitId: number, direction: 'UP' | 'DOWN'): void;
  editHabit(options: EditHabitOptions): void;
}
export function HabitBottomButtonGroup(props: HabitBottomButtonGroupProps) {
  const { routine, habit, deleteHabitCallback, editHabit } = props;

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

  return (
    <ButtonGroup
      className='float-right mt-2 w-100'
    >
      <Button
        onClick={() => editHabit({ title: window.prompt(`Renaming habit "${habit.title}"`) })}
        variant='secondary'
      >
        Rename
      </Button>
      <Button
        onClick={deleteHabit}
        variant='secondary'
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
