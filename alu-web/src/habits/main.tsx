import React, { useMemo, useState } from 'react';
// TODO: turn these imports into the direct ones
import { Alert, Button, ButtonGroup, Card, Col, Container, Form, Row, ToggleButton } from 'react-bootstrap';
import { Habit, HabitValue, Routine } from './types';
import { CreateRoutineButton, CreateHabitButton, DeleteHabitButton } from './buttons';
import { errorHandler, useApiObjectHook } from '../utils';
import { apiHabitEdit, apiRoutineDelete, apiRoutineEdit, apiRoutineList } from '../lookup';
import './main.css';


export default function Habits() {
  const [routines, setRoutines] = useApiObjectHook<Routine[]>(apiRoutineList, [200], 9001);
  const [selectedRoutine, setSelectedRoutine] = useState(0);

  const createRoutineCallback = (routine: Routine) => {
    if (!routines) return;
    setRoutines([...routines, routine]);
    setSelectedRoutine(routines.length);
  }

  const editRoutineCallback = (routine: Routine) => {
    if (!routines) return;
    setRoutines([
      ...routines.slice(0, selectedRoutine),
      routine,
      ...routines.slice(selectedRoutine + 1),
    ]);
  }

  const createHabitCallback = (habit: Habit) => {
    if (!routines) return;
    let editedRoutine = routines[selectedRoutine];
    editedRoutine.habits = [...editedRoutine.habits, habit];

    setRoutines([
      ...routines.slice(0, selectedRoutine),
      editedRoutine,
      ...routines.slice(selectedRoutine + 1),
    ]);
  }

  const editHabitCallback = (habit: Habit) => {
    if (!routines) return;
    // TODO: there's probably a better way to do this
    const indexOfHabit = routines[selectedRoutine].habits.map(
      habit => habit.id
    ).indexOf(habit.id);
    let editedRoutine = routines[selectedRoutine];
    editedRoutine.habits[indexOfHabit] = habit;

    setRoutines([
      ...routines.slice(0, selectedRoutine),
      editedRoutine,
      ...routines.slice(selectedRoutine + 1),
    ]);
  }

  const deleteRoutineCallback = (routineId: number) => {
    if (!routines) return;
    const newRoutines = routines.filter(routine => routine.id !== routineId);
    setSelectedRoutine(Math.min(selectedRoutine, newRoutines.length - 1));
    setRoutines(newRoutines);
  }

  const deleteHabitCallback = (habitId: number) => {
    if (!routines) return;
    const indexOfHabit = routines[selectedRoutine].habits.map(
      habit => habitId
    ).indexOf(habitId);
    let editedRoutine = routines[selectedRoutine];
    editedRoutine.habits.splice(indexOfHabit, 1);

    setRoutines([
      ...routines.slice(0, selectedRoutine),
      editedRoutine,
      ...routines.slice(selectedRoutine + 1),
    ]);
  }

  if (!routines) return <p className='text-center'>Loading...</p>

  return (<>
    <h1 className='text-center'>Habits</h1>
    <Container>
      {routines.length === 0 ? <div className='text-center'>
        <p>You don't have any routines yet</p>
        <CreateRoutineButton
          createRoutineCallback={createRoutineCallback}
        />
        {/* TODO: tutorial for Habits will go here */}
      </div> :
        <Row>
          <Col xs={2}>
            <CreateRoutineButton
              createRoutineCallback={createRoutineCallback}
              className='w-100 mb-3'
            />
            {routines.map((routine, index) =>
              <Alert
                key={index}
                variant={index === selectedRoutine ? 'success' : 'primary'}
                onClick={() => setSelectedRoutine(index)}
                role='button'
                className='text-center'
              >
                {routine.title}
              </Alert>)
            }
          </Col>
          <Col xs={10} style={{ borderLeft: '1px solid' }}>
            {routines[selectedRoutine] && <RenderRoutine
              routine={routines[selectedRoutine]}
              createHabitCallback={createHabitCallback}
              editHabitCallback={editHabitCallback}
              editRoutineCallback={editRoutineCallback}
              deleteRoutineCallback={deleteRoutineCallback}
              deleteHabitCallback={deleteHabitCallback}
            />}
          </Col>
        </Row>
      }
    </Container>
  </>);
}


interface EditRoutineOptions {
  title?: string | null;
  ordered?: boolean;
}
interface RenderRoutineProps {
  routine: Routine;
  createHabitCallback(habit: Habit): void;
  editHabitCallback(habit: Habit): void;
  editRoutineCallback(routine: Routine): void;
  deleteRoutineCallback(routineId: number): void;
  deleteHabitCallback(habitId: number): void;
}
function RenderRoutine(props: RenderRoutineProps) {
  const { routine, createHabitCallback, editHabitCallback, editRoutineCallback, deleteHabitCallback, deleteRoutineCallback } = props;

  const editRoutine = (options: EditRoutineOptions) => {
    apiRoutineEdit(routine.id, options.title, options.ordered, (response, status) => {
      if (status === 200) {
        editRoutineCallback(response);
      } else {
        errorHandler(response, status, 9004);
      }
    });
  }

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
    })
  }

  return (<>
    <h3>
      <span
        role='button'
        className='underline-on-hover'
        onClick={() => editRoutine({ title: window.prompt(`Renaming Routine ${routine.title}`) })}
      >
        {routine.title}
      </span>
      <Button
        className='float-right'
        variant='danger'
        onClick={deleteRoutine}
      >
        Delete Routine
      </Button>
    </h3>
    <hr />
    {routine.habits.length === 0 ?
      <p>This routine doesn't have any habits yet</p>
    : routine.habits.map((habit, i) =>
      <RenderHabit
        habit={habit}
        routineId={routine.id}
        editHabitCallback={editHabitCallback}
        deleteHabitCallback={deleteHabitCallback}
        key={`${routine.id}-${i}`}
      />
    )}
    <hr />
    <CreateHabitButton
      createHabitCallback={createHabitCallback}
      routineId={routine.id}
    />
  </>);
}

interface EditHabitOptions {
  title?: string | null;
  cue?: string;
  craving?: string;
  response?: string;
  reward?: string;
  value?: HabitValue;
}
interface RenderHabitProps {
  habit: Habit;
  routineId: number;
  editHabitCallback(habit: Habit): void;
  deleteHabitCallback(habitId: number): void;
}
function RenderHabit(props: RenderHabitProps) {
  const { habit, routineId, editHabitCallback, deleteHabitCallback } = props;
  const [showBody, setShowBody] = useState(false);
  const color = useMemo(() => {
    switch (habit.value) {
      case 'POSITIVE':
        return 'success';
      case 'NEGATIVE':
        return 'danger';
      case 'NEUTRAL':
        return 'primary';
    }
  }, [habit]);

  const editHabit = (options: EditHabitOptions) => {
    apiHabitEdit(routineId, habit.id, options.title, options.cue, options.craving, options.response, options.reward, options.value, (response, status) => {
      if (status === 200) {
        editHabitCallback(response);
      } else {
        errorHandler(response, status, 9003);
      }
    });
  }

  return (<>
    <Card
      bg={color}
      text='white'
      className='mb-2'
    >
      <Card.Header
        // The weird check in here is to prevent clicking on the title
        // to rename the Habit from expanding the body
        onClick={e => {if (e.target === e.currentTarget) setShowBody(!showBody)}}
        role='button'
      >
        <span
          role='button'
          onClick={() => editHabit({ title: window.prompt(`Renaming Habit "${habit.title}"`) })}
          className='underline-on-hover'
        >
          {habit.title}
        </span>
      </Card.Header>
      {showBody && <Card.Body>
        <Row>
          <Col>
            <Form.Label>Cue</Form.Label>
            <Form.Control
              type='text'
              name='cue'
              maxLength={128}
              required
              defaultValue={habit.cue}
              onBlur={e => editHabit({ cue: e.target.value })}
            />
          </Col>
          <Col>
            <Form.Label>Craving</Form.Label>
            <Form.Control
              type='text'
              name='craving'
              maxLength={128}
              required
              defaultValue={habit.craving}
              onBlur={e => editHabit({ craving: e.target.value })}
            />
          </Col>
          <Col>
            <Form.Label>Response</Form.Label>
            <Form.Control
              type='text'
              name='response'
              maxLength={128}
              required
              defaultValue={habit.response}
              onBlur={e => editHabit({ response: e.target.value })}
            />
          </Col>
          <Col>
            <Form.Label>Reward</Form.Label>
            <Form.Control
              type='text'
              name='reward'
              maxLength={128}
              required
              defaultValue={habit.reward}
              onBlur={e => editHabit({ reward: e.target.value })}
            />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <Form.Label>Value</Form.Label>
            <br />
            <ButtonGroup toggle>
              {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((value, i) => (
                <ToggleButton
                  key={i}
                  type='radio'
                  variant={['success', 'primary', 'danger'][i]}
                  name='radio'
                  value={value}
                  checked={habit.value === value}
                  onChange={(e) => editHabit({ value: e.currentTarget.value as HabitValue })}
                >
                  {value[0] + value.slice(1).toLowerCase()}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <DeleteHabitButton
              routineId={routineId}
              habitId={habit.id}
              deleteHabitCallback={deleteHabitCallback}
            />
          </Col>
        </Row>
      </Card.Body>}
    </Card>
  </>);
}
