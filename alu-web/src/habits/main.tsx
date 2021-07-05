import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Habit, Routine } from './types';
import { CreateRoutineButton } from './buttons';
import { useApiObjectHook } from '../utils';
import { SetupTutorial, SlidesPlayer } from './tutorials';
import { apiRoutineList } from '../lookup';
import { RenderRoutine } from './routine';
import './main.css';


export default function Habits() {
  const [routines, setRoutines] = useApiObjectHook<Routine[]>(apiRoutineList, [200], 9001);
  const [selectedRoutine, setSelectedRoutine] = useState(0);
  const [tutorial, setTutorial] = useState('intro');

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
    <Container>
      {routines.length === 0 ? <div className='text-center'>
        {tutorial === 'intro' && <SlidesPlayer preset='intro' finishedCallback={() => setTutorial('setup')} />}
        {tutorial === 'setup' && <SetupTutorial createRoutineCallback={createRoutineCallback} />}
      </div> : <>
        <h1 className='text-center'>Habits</h1>
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
      </>}
    </Container>
  </>);
}
