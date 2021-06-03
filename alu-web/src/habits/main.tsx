import React, { useMemo, useState } from 'react';
// TODO: turn these imports into the direct ones
import { Alert, ButtonGroup, Card, Col, Container, Form, OverlayTrigger, Row, ToggleButton } from 'react-bootstrap';
import { Habit, HabitValue, Routine } from './types';
import { CreateRoutineButton, CreateHabitButton, HabitButtonGroup, RoutineButtonGroup } from './buttons';
import { errorHandler, generateTooltip, stringDate, useApiObjectHook } from '../utils';
import { apiHabitEdit, apiRoutineEdit, apiRoutineList } from '../lookup';
import './main.css';
import { HistoryAction } from '../lookup/lookup';


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
      habit => habit.id
    ).indexOf(habitId);
    let editedRoutine = routines[selectedRoutine];
    editedRoutine.habits.splice(indexOfHabit, 1);

    setRoutines([
      ...routines.slice(0, selectedRoutine),
      editedRoutine,
      ...routines.slice(selectedRoutine + 1),
    ]);
  }

  const rearrangeRoutineCallback = (routineId: number, direction: 'UP' | 'DOWN') => {
    if (!routines) return;
    if (direction === 'UP') {
      let editedRoutine = routines[selectedRoutine];
      let otherRoutine = routines[selectedRoutine - 1];
      editedRoutine.routine_num--;
      otherRoutine.routine_num++;

      setRoutines([
        ...routines.slice(0, selectedRoutine - 1),
        editedRoutine,
        otherRoutine,
        ...routines.slice(selectedRoutine + 1),
      ]);
      setSelectedRoutine(selectedRoutine - 1);
    } else {
      let editedRoutine = routines[selectedRoutine];
      let otherRoutine = routines[selectedRoutine + 1];
      editedRoutine.routine_num++;
      otherRoutine.routine_num--;

      setRoutines([
        ...routines.slice(0, selectedRoutine),
        otherRoutine,
        editedRoutine,
        ...routines.slice(selectedRoutine + 2),
      ]);
      setSelectedRoutine(selectedRoutine + 1);
    }
  }
  
  const rearrangeHabitCallback = (habitId: number, direction: 'UP' | 'DOWN') => {
    if (!routines) return;
    const indexOfHabit = routines[selectedRoutine].habits.map(
      habit => habit.id
    ).indexOf(habitId);
    let editedRoutine = routines[selectedRoutine];

    if (direction === 'UP') {
      editedRoutine.habits[indexOfHabit].habit_num--;
      editedRoutine.habits[indexOfHabit - 1].habit_num++;
      [
        editedRoutine.habits[indexOfHabit - 1],
        editedRoutine.habits[indexOfHabit],
      ] = [
        editedRoutine.habits[indexOfHabit],
        editedRoutine.habits[indexOfHabit - 1],
      ];
    } else {
      editedRoutine.habits[indexOfHabit].habit_num++;
      editedRoutine.habits[indexOfHabit + 1].habit_num--;
      [
        editedRoutine.habits[indexOfHabit],
        editedRoutine.habits[indexOfHabit + 1],
      ] = [
        editedRoutine.habits[indexOfHabit + 1],
        editedRoutine.habits[indexOfHabit],
      ];
    }

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
              numRoutines={routines.length}
              createHabitCallback={createHabitCallback}
              editHabitCallback={editHabitCallback}
              editRoutineCallback={editRoutineCallback}
              deleteRoutineCallback={deleteRoutineCallback}
              deleteHabitCallback={deleteHabitCallback}
              rearrangeRoutineCallback={rearrangeRoutineCallback}
              rearrangeHabitCallback={rearrangeHabitCallback}
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
  numRoutines: number;
  createHabitCallback(habit: Habit): void;
  editHabitCallback(habit: Habit): void;
  editRoutineCallback(routine: Routine): void;
  deleteRoutineCallback(routineId: number): void;
  deleteHabitCallback(habitId: number): void;
  rearrangeRoutineCallback(routineId: number, direction: 'UP' | 'DOWN'): void;
  rearrangeHabitCallback(habitId: number, direction: 'UP' | 'DOWN'): void;
}
function RenderRoutine(props: RenderRoutineProps) {
  const { routine, numRoutines, createHabitCallback, editHabitCallback, editRoutineCallback, deleteHabitCallback, deleteRoutineCallback, rearrangeRoutineCallback, rearrangeHabitCallback } = props;

  const editRoutine = (options: EditRoutineOptions) => {
    apiRoutineEdit(routine.id, options.title, options.ordered, (response, status) => {
      if (status === 200) {
        editRoutineCallback(response);
      } else {
        errorHandler(response, status, 9004);
      }
    });
  }

  return (<>
    <h3>
      <span
        role='button'
        className='underline-on-hover'
        onClick={() => editRoutine({ title: window.prompt(`Renaming routine "${routine.title}"`) })}
      >
        {routine.title}
      </span>
      <RoutineButtonGroup
        routine={routine}
        numRoutines={numRoutines}
        deleteRoutineCallback={deleteRoutineCallback}
        rearrangeRoutineCallback={rearrangeRoutineCallback}
      />
    </h3>
    <hr />
    {routine.habits.length === 0 ?
      <p>This routine doesn't have any habits yet</p>
    : routine.habits.map((habit, i) =>
      <RenderHabit
        routine={routine}
        habit={habit}
        editHabitCallback={editHabitCallback}
        deleteHabitCallback={deleteHabitCallback}
        rearrangeHabitCallback={rearrangeHabitCallback}
        key={`${routine.id}-${habit.id}`}
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
  notes?: string;
  historyAction?: HistoryAction;
  value?: HabitValue;
}
interface RenderHabitProps {
  routine: Routine;
  habit: Habit;
  editHabitCallback(habit: Habit): void;
  deleteHabitCallback(habitId: number): void;
  rearrangeHabitCallback(habitId: number, direction: 'UP' | 'DOWN'): void;
}
function RenderHabit(props: RenderHabitProps) {
  const { habit, routine, editHabitCallback, deleteHabitCallback, rearrangeHabitCallback } = props;
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
  const streak = useMemo(() => {
    const sorted = habit.history.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      sorted.length === 0 ||
      (
        sorted[0].date !== stringDate() &&
        sorted[0].date !== stringDate(yesterday)
      )
    )
      return 0;
    
    let streak = 1;  // initialized to 1 because we know the
                     // user did the habit in the last day or so
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].date);
      const previousDate = new Date(sorted[i - 1].date);
      currentDate.setDate(currentDate.getDate() + 1);
      if (
        currentDate.getDate() === previousDate.getDate() &&
        currentDate.getMonth() === previousDate.getMonth() &&
        currentDate.getFullYear() === previousDate.getFullYear()
      ) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [habit]);

  const editHabit = (options: EditHabitOptions) => {
    apiHabitEdit(
      routine.id,
      habit.id,
      options.title,
      options.cue,
      options.craving,
      options.response,
      options.reward,
      options.notes,
      options.historyAction,
      options.value,
      (response, status) => {
        if (status === 200) {
          editHabitCallback(response);
        } else {
          errorHandler(response, status, 9003);
        }
      }
    );
  }

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
          onClick={() => editHabit({ title: window.prompt(`Renaming habit "${habit.title}"`) })}
          className='underline-on-hover'
        >
          {habit.title}
        </span>
        <span
          className='float-right'
          role='button'
          onClick={updateHistory}
        >
          {habit.value !== 'NEUTRAL' && <OverlayTrigger
            placement='left'
            delay={{ show: 250, hide: 400 }}
            overlay={generateTooltip(
              habit.value === 'POSITIVE' ?
              'Mark this habit as completed for the day'
              :
              'Mark this habit as avoided for the day'
            )}
          >
            {completedToday ?
              <i className='fas fa-check-circle' />
            :
              <i className='far fa-circle' />
            }
          </OverlayTrigger>}
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
              defaultValue={habit.reward}
              onBlur={e => editHabit({ reward: e.target.value })}
            />
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as='textarea'
              name='notes'
              maxLength={4096}
              rows={10}
              defaultValue={habit.notes}
              onBlur={e => editHabit({ notes: e.target.value })}
            />
          </Col>
          {habit.value !== 'NEUTRAL' && <Col>
            <p>Strategies to {habit.value === 'POSITIVE' ? 'build' : 'break'} this habit:</p>
            <ul>
              <li>How can I make it {habit.value === 'POSITIVE' ? 'obvious' : 'invisible'}?</li>
              <li>How can I make it {habit.value === 'POSITIVE' ? 'attractive' : 'unattractive'}?</li>
              <li>How can I make it {habit.value === 'POSITIVE' ? 'easy' : 'difficult'}?</li>
              <li>How can I make it {habit.value === 'POSITIVE' ? 'satisfying' : 'unsatisfying'}?</li>
              {habit.value === 'NEGATIVE' &&
                <li>What habit can I replace this with?</li>
              }
            </ul>
          </Col>}
        </Row>
        <hr />
        <Row>
          <Col>
            Streak: {streak}
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
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
          <Col>
            <HabitButtonGroup
              routine={routine}
              habit={habit}
              deleteHabitCallback={deleteHabitCallback}
              rearrangeHabitCallback={rearrangeHabitCallback}
            />
          </Col>
        </Row>
      </Card.Body>}
    </Card>
  </>);
}
