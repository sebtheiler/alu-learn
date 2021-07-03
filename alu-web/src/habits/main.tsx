import React, { useMemo, useState } from 'react';
// TODO: turn these imports into the direct ones
import { Alert, Button, ButtonGroup, Card, Col, Container, Form, OverlayTrigger, Row, ToggleButton } from 'react-bootstrap';
import { Habit, HabitValue, Routine } from './types';
import { CreateRoutineButton, CreateHabitButton, HabitButtonGroup, RoutineButtonGroup } from './buttons';
import { errorHandler, generateTooltip, QuestionBubble, stringDate, useApiObjectHook } from '../utils';
import { SetupTutorial, SlidesPlayer } from './tutorials';
import { apiHabitEdit, apiRoutineEdit, apiRoutineList } from '../lookup';
import './main.css';
import { HistoryAction } from '../lookup/lookup';


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

  const tutorialParts = ['setup', 'values', 'habit-parts', 'strategies', 'final'];
  const [tutorialPart, setTutorialPart] = useState(0);

  const showTutorial = useMemo(() => window.sessionStorage.getItem('finishedTutorial') !== 'true', []);

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
    {showTutorial && numRoutines === 1 && <>
      <p>
        {tutorialParts[tutorialPart] === 'setup' && <>
          Great!  Now we are going to fill this routine with a couple habits. Create a habit using the input.<br />
          (example below)
        </>}
        {tutorialParts[tutorialPart] === 'values' && <>
          Now, click on each of the habits and assign it a value: positive/neutral/negative.
          This represents whether the habit is good (positive) or bad (negative).<br />
          (example below)
        </>}
        {tutorialParts[tutorialPart] === 'habit-parts' && <>
          As you might've seen when assigning values, there are are four parts that influence a habit (and a section for taking notes).
          These are:
          <ul>
            <li>Cue: the trigger your brain receives to start a certain habit</li>
            <li>Craving: the reason you are motivated to do this habit</li>
            <li>Response: the behavior you do to perform this habit</li>
            <li>Reward: the positive feeling you get for completing the habit</li>
          </ul>
          A cue triggers a craving, which motivates a response resulting in a reward.
          <br/><br />
          Look at some of your good or bad habits that you want to build or break, and identify these four components for those habits.
          This is essential to being able to modify your habits.<br />
          (you can hover the question bubbles for more info)
        </>}
        {tutorialParts[tutorialPart] === 'strategies' && <>
          Almost done!  With these four components, you can try to answer the some strategies that will help you build/break the habit.
          <br /><br />
          These strategies are built on the four components and will help you turn your habit change into action.
          (don't forget you can hover the question bubbles for more info)
        </>}
        {tutorialParts[tutorialPart] === 'final' && <>
          There you go!  You've just started changing your habits!  What next?<br />
          After completing a good habit, or avoiding a bad one, you can mark it as finished by clicking the circle icon on its right.  This will reset every day.<br />
          If you want to build/break more habits in this routine, you can fill out their four components and try to answer some strategies for them.
          If you want to work on a different set of habits, you can create a different routine (e.g., one for the evening).
          Outside of just routines, you can also have more general habits, such as checking social media when you're stuck.
          (remember not to make too many changes at once, or you will get burnt out and won't make any of them.)
          <br /><br />
          Changing habits isn't instant, and that can be frustrating.  But if you follow the strategies in Alu and give it enough
          dedication, it will happen.
          <br /><br />
          The book <em><a href='https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299' target='_blank' rel='noopener noreferrer'>Atomic Habits</a></em> by James Clear
          has inspired a lot of the content here and is a great read if you want to learn more about habits.
          <br /><br />
          Final tips: you can rearrange habits with "Move Up/Down" and rename them by clicking their titles.
        </>}
      </p>
      {routine.habits.length > 0 && tutorialPart < tutorialParts.length &&
        <Button
          className='mb-3 mx-auto text-center'
          onClick={() => {
            setTutorialPart(tutorialPart + 1);

            // If this is the last part, mark the tutorial as finished
            if (tutorialPart === tutorialParts.length - 1)
              window.sessionStorage.setItem('finishedTutorial', 'true')
          }}
        >
          I'm Finished
        </Button>
      }
      <hr />
    </>}
    {(routine.habits.length === 0) && (numRoutines > 1) &&
      <p className='text-center'>Create some habits to get started!</p>
    }
    {routine.habits.map((habit) =>
      <RenderHabit
        routine={routine}
        habit={habit}
        editHabitCallback={editHabitCallback}
        deleteHabitCallback={deleteHabitCallback}
        rearrangeHabitCallback={rearrangeHabitCallback}
        key={`${routine.id}-${habit.id}`}
      />)
    }
    <hr />
    <CreateHabitButton
      createHabitCallback={createHabitCallback}
      routineId={routine.id}
    />
    {numRoutines === 1 && showTutorial && tutorialPart < tutorialParts.length && <>
      <br />
      <hr />
      <p>Example:</p>
      {(tutorialParts[tutorialPart] === 'setup') && <>
        <img
          src='/static/images/basic-routine.png'
          alt='An example routine: Wake up; Turn on computer; Check social media; Eat breakfast; Watch YouTube; Study with Alu; Start School'
          width='100%'
        />
      </>}
      {(tutorialParts[tutorialPart] === 'values') && <>
        <img
          src='/static/images/values-routine.png'
          alt='An example routine, annotated with values'
          width='100%'
        />
      </>}
      {(tutorialParts[tutorialPart] === 'habit-parts') && <>
        <img
          src='/static/images/habit-components.png'
          alt='Two example habits, annotated with each of their four components'
          width='100%'
        />
      </>}
      {(tutorialParts[tutorialPart] === 'strategies') && <>
        <img
          src='/static/images/habit-strategies.png'
          alt='Two example habits, annotated with strategies to build/break them'
          width='100%'
        />
      </>}
    </>}
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
            <Form.Label>
              Cue{' '}
              <QuestionBubble isWhite>
                Cue is the trigger your brain receives to start a certain habit.{' '}
                {habit.value === 'POSITIVE' && 'For example, finishing brushing your teeth might be the cue to study with Alu for 15 minutes.'}
                {habit.value === 'NEGATIVE' && 'For example, feeling stuck on an assignment might be the cue to check social media.'}
                {habit.value === 'NEUTRAL' && 'For example, finishing exercising might be the cue to take a shower.'}
                {' '}Cues should be specific and immediately actionable.
              </QuestionBubble>
            </Form.Label>
            <Form.Control
              type='text'
              name='cue'
              maxLength={128}
              defaultValue={habit.cue}
              onBlur={e => editHabit({ cue: e.target.value })}
            />
          </Col>
          <Col>
            <Form.Label>
              Craving{' '}
              <QuestionBubble isWhite>
                Craving is the reason you are motivated to do this habit.{' '}
                {habit.value === 'POSITIVE' && 'For example, wanting to do well in school and feel productive might be the craving to study.'}
                {habit.value === 'NEGATIVE' && 'For example, wanting to escape the work you have to do might be the craving to open social media.'}
                {habit.value === 'NEUTRAL' && 'For example, wanting to feel clean might be the craving to take a shower.'}
              </QuestionBubble>
            </Form.Label>
            <Form.Control
              type='text'
              name='craving'
              maxLength={128}
              defaultValue={habit.craving}
              onBlur={e => editHabit({ craving: e.target.value })}
            />
          </Col>
          <Col>
            <Form.Label>
              Response{' '}
              <QuestionBubble isWhite>
                Response is the behavior you do to perform this habit.{' '}
                {habit.value === 'POSITIVE' && 'For example, opening Alu or Khan Academy and studying might be the response to wanting to study.'}
                {habit.value === 'NEGATIVE' && 'For example, browsing social media is the response to wanting to escape your work.'}
                {habit.value === 'NEUTRAL' && 'For example, taking a shower might be the response to wanting to feel clean.'}
              </QuestionBubble>
            </Form.Label>
            <Form.Control
              type='text'
              name='response'
              maxLength={128}
              defaultValue={habit.response}
              onBlur={e => editHabit({ response: e.target.value })}
            />
          </Col>
          <Col>
            <Form.Label>
              Reward{' '}
              <QuestionBubble isWhite>
                Reward is the positive feeling you get for completing the habit.{' '}
                {habit.value === 'POSITIVE' && 'For example, finishing studying, increasing your streak, and feeling productive might make you satisfied since you have less work to do.  Studying becomes associated with wanting to feel productive.'}
                {habit.value === 'NEGATIVE' && 'For example, browsing social media might relieve you from having to do work.  Browsing social media becomes associated with feeling stuck.'}
                {habit.value === 'NEUTRAL' && 'For example, taking a shower satisfies your craving to feel clean.  Taking a shower becomes associated with wanting to feel clean.'}
              </QuestionBubble>
            </Form.Label>
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
            {habit.value === 'POSITIVE' ? <ul>
              <li>
                How can I make it obvious?{' '}
                <QuestionBubble isWhite>
                  Design your environment in a way that makes the cues of this habit obvious and visible.{' '}
                  For example, promise to study for an hour (action) in your room (place) every evening after you finish your homework (time).
                  If you are specific like this example, you are more likely to actually follow through with your intentions.
                </QuestionBubble>
              </li>
              <li>
                How can I make it attractive?{' '}
                <QuestionBubble isWhite>
                  Highlight the benefits of doing your good habit regularly.
                  For example, list out the benefits of studying everyday to clarify your motivation.
                  Another option is to join a group of people who also want to build the same habit, such as a study-group.
                  You can also "bundle" your good habit with something you naturally enjoy doing, like listening to an audiobook/podcast as you clean your room.
                </QuestionBubble>
              </li>
              <li>
                How can I make it easy?{' '}
                <QuestionBubble isWhite>
                  Change your environment to decrease your good habit's friction and make it easier to complete.
                  For example, keep study materials at arms reach so that there's little friction between you and studying, while keeping distractions (like your phone) in another room.
                </QuestionBubble>{' '}
                <QuestionBubble isWhite>
                  When you first start building study habits, you can also start with ridiculously tiny habits, like just studying for a single minute or doing a single flashcard.
                  These tiny habits give you no excuse to not do them, and you can slowly build them into larger habits.
                  You can't improve a habit you don't have, so start small.
                </QuestionBubble>
              </li>
              <li>
                How can I make it satisfying?{' '}
                <QuestionBubble isWhite>
                  Give yourself a reward for completing your good habit.
                  For example, if you can study without distractions for a 25 minutes, give yourself 5 minutes of freedom (or longer intervals, if you'd like).
                </QuestionBubble>
              </li>
            </ul> : <ul>
              <li>
                How can I make it invisible?{' '}
                <QuestionBubble isWhite>
                  Design your environment in a way that reduces exposure to this habit and makes its cues invisible.{' '}
                  For example, disable notifications or move your phone to another room.
                </QuestionBubble>
              </li>
              <li>
                How can I make it unattractive?{' '}
                <QuestionBubble isWhite>
                  Highlight the benefits of avoiding your bad habit.
                  For example, make a list of benefits you would gain from avoiding social media, like having more time and energy available.
                </QuestionBubble>
              </li>
              <li>
                How can I make it difficult?{' '}
                <QuestionBubble isWhite>
                  Change your environment to increase your bad habit's friction and make it more difficult.
                  For example, install an app/<a href='https://chrome.google.com/webstore/detail/self-control/ncaaipdfhdijmfdfmeoagmogddhkfdec?hl=en' target='_blank' rel='noreferrer'>browser-extension</a> that stops you from accessing an app/website that you spend too much time on.
                  You could also put your phone in another room to completely avoid temptation.
                </QuestionBubble>
              </li>
              <li>
                How can I make it unsatisfying?{' '}
                <QuestionBubble isWhite>
                  How can you make the costs of your bad habit as unsatisfying and immediately painful as possible?
                  For example, get an "accountability partner" who has the same goal as you, and you promise to update on how well you did your bad habit.
                </QuestionBubble>
              </li>
              <li>
                What habit can I replace this with?{' '}
                <QuestionBubble isWhite>
                  It is easier to replace a habit than simply remove it.
                  For example, instead of checking social media when you get a notification, you could associate that cue with doing a few jumping-jacks instead.
                </QuestionBubble>
              </li>
            </ul>}
            You don't need all of these to be successful, but the more the better
          </Col>}
        </Row>
        <hr />
        {habit.value !== 'NEUTRAL' && <>
          <Row>
            <Col>
              Streak: {streak}
            </Col>
          </Row>
          <hr />
        </>}
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
