import React, { useMemo, useState } from 'react';
// TODO: turn these imports into the direct ones
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Habit, Routine } from './types';


const testRoutine = {
  title: 'Morning Routine',
  habits: [
    {
      title: 'Wake up',
      value: 'NEUTRAL',
    },
    {
      title: 'Turn on computer',
      value: 'NEUTRAL',
    },
    {
      title: 'Browse internet',
      value: 'NEGATIVE',
    },
    {
      title: 'Exercise',
      value: 'POSITIVE',
    },
    {
      title: 'Eat breakfast',
      value: 'NEUTRAL',
    },
    {
      title: 'Watch YouTube',
      value: 'NEGATIVE',
    },
    {
      title: 'Play games',
      value: 'NEGATIVE',
    },
    {
      title: 'Brush teeth',
      value: 'NEUTRAL',
    },
    {
      title: 'Do Alu reviews',
      value: 'POSITIVE',
    },
    {
      title: 'Do homework',
      value: 'POSITIVE',
    },
  ]
} as Routine;


export default function Habits() {
  return (<>
    <h1 className='text-center'>Habits</h1>
    <Container>
      <RenderRoutine routine={testRoutine} />
    </Container>
  </>);
}


interface RenderRoutineProps {
  routine: Routine;
}
function RenderRoutine(props: RenderRoutineProps) {
  const { routine } = props;

  return (<>
    <h3>{routine.title}</h3>
    <hr />
    {routine.habits.map((habit, i) => <RenderHabit habit={habit} key={i} />)}
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
