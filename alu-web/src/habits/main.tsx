import React, { useMemo, useState } from 'react';
// TODO: turn these imports into the direct ones
import { Alert, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Habit, Routine } from './types';
import { CreateRoutineButton, CreateHabitButton } from './buttons';
import { useApiObjectHook } from '../utils';
import { apiRoutineList } from '../lookup';


export default function Habits() {
  const [routines, setRoutines] = useApiObjectHook<Routine[]>(apiRoutineList, [200], 9001);
  const [selectedRoutine, setSelectedRoutine] = useState(0);

  const createRoutineCallback = (routine: Routine) => {
    if (!routines) return;
    setRoutines([...routines, routine]);
    setSelectedRoutine(routines.length - 1);
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
            <RenderRoutine
              routine={routines[selectedRoutine]}
              createHabitCallback={createHabitCallback}
            />
          </Col>
        </Row>
      }
    </Container>
  </>);
}


interface RenderRoutineProps {
  routine: Routine;
  createHabitCallback(newHabit: Habit): void;
}
function RenderRoutine(props: RenderRoutineProps) {
  const { routine, createHabitCallback } = props;

  return (<>
    <h3>{routine.title}</h3>
    <hr />
    {routine.habits.length === 0 &&
      <p>This routine doesn't have any habits yet</p>
    }
    {routine.habits.map((habit, i) =>
      <RenderHabit habit={habit} key={i} />
    )}
    <hr />
    <CreateHabitButton createHabitCallback={createHabitCallback} routineId={routine.id} />
  </>);
}

interface RenderHabitProps {
  habit: Habit;
}
function RenderHabit(props: RenderHabitProps) {
  const { habit } = props;
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

  return (<>
    <Card
      bg={color}
      text='white'
      className='mb-2'
    >
      <Card.Header
        onClick={() => setShowBody(!showBody)}
        role='button'
      >
        {habit.title}
      </Card.Header>
      {showBody && <Card.Body>
        <Card.Text>
          <Row>
            <Col>
              <Form.Label>Cue</Form.Label>
              <Form.Control
              />
            </Col>
            <Col>
              <Form.Label>Craving</Form.Label>
              <Form.Control
              />
            </Col>
            <Col>
              <Form.Label>Response</Form.Label>
              <Form.Control
              />
            </Col>
            <Col>
              <Form.Label>Reward</Form.Label>
              <Form.Control
              />
            </Col>
          </Row>
        </Card.Text>
      </Card.Body>}
    </Card>
  </>);
}
