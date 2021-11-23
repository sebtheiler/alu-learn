import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { CreateRoutineButton } from './buttons';
import { Habit, Routine } from './types';
import { RenderRoutine } from './routine';
import { SetupTutorial, SlidesPlayer } from './tutorials';
import { TodoList } from './todo';
import { apiRoutineList } from '../lookup';
import { getCookie, setCookie, useApiObjectHook } from '../utils';
import { useState } from 'react';
import './main.scss';


export default function Habits() {
  const [routines, setRoutines] = useApiObjectHook<Routine[]>(apiRoutineList, [200], 9001, [], (response: Routine[]) => {
    let newTutorial;
    if (getCookie('finishedTutorial') === 'true') newTutorial = 'finished';
    else if (response.length > 0) newTutorial = 'setup';
    else newTutorial = 'intro';
    setTutorial(newTutorial);
  });
  const [selectedRoutine, setSelectedRoutine] = useState(0);
  const [tutorial, setTutorial] = useState(getCookie('finishedTutorial') === 'true' ? 'finished' : 'intro');

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
      <div className='text-center'>
        {tutorial === 'intro' && <SlidesPlayer finishedCallback={() => setTutorial('create-routine')} />}
        {tutorial === 'create-routine' && <>
          <h1>Create a Routine</h1>
          <p>Great!  I'm glad you decided to use <em>Habits!</em></p>
          <p>Habits are organized into routines, which makes it easier to group similar ones together</p>
          <p>To get started, create a routine below (maybe you want to call it "Morning")</p>
          <CreateRoutineButton createRoutineCallback={routine => {
            setTutorial('setup');
            createRoutineCallback(routine);
          }} />
        </>}
        {tutorial === 'setup' && <SetupTutorial
          routine={routines[0]}
          createHabitCallback={createHabitCallback}
          editHabitCallback={editHabitCallback}
          // editRoutineCallback={editRoutineCallback}
          // deleteRoutineCallback={deleteRoutineCallback}
          deleteHabitCallback={deleteHabitCallback}
          // rearrangeRoutineCallback={rearrangeRoutineCallback}
          rearrangeHabitCallback={rearrangeHabitCallback}
          finishedCallback={() => {
            setTutorial('finished');
            setCookie('finishedTutorial', 'true', 90);
          }}
        />}
      </div>
      {tutorial === 'finished' && <>
        <h1 className='text-center'>Habits</h1>
        <Row>
          <Col xs={12} md={2}>
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
          <Col xs={12} md={8} style={{ borderLeft: '1px solid', borderRight: '1px solid' }}>
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
          <Col xs={12} md={2}>
            <TodoList />
          </Col>
        </Row>
      </>}
    </Container>
  </>);
}
