import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import ToggleButton from 'react-bootstrap/ToggleButton';
import { Habit, HabitValue, Routine, ShowOptions, EditHabitOptions } from './types';
import { HabitBottomButtonGroup, HabitTopButtonGroup } from './buttons';
import { apiHabitEdit } from '../lookup';
import { errorHandler, QuestionBubble, stringDate } from '../utils';
import { useMemo, useState } from 'react';
import './main.scss';


interface RenderHabitProps {
  routine: Routine;
  habit: Habit;
  editHabitCallback(habit: Habit): void;
  deleteHabitCallback(habitId: number): void;
  rearrangeHabitCallback(habitId: number, direction: 'UP' | 'DOWN'): void;
  show?: ShowOptions[];  /** Used in the tutorial for only displaying parts of the habit */
}
export function RenderHabit(props: RenderHabitProps) {
  const { habit, routine, editHabitCallback, deleteHabitCallback, rearrangeHabitCallback, show=['VALUES', 'BUTTONS', 'COMPONENTS', 'NOTES', 'OTHER'] } = props;
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
  const [streak, hasDoneToday] = useMemo(() => {
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
      return [0, false];
    
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

    // Latest date is done and the same date as today
    const hasDoneToday = (
      sorted[0].done &&
      (
        new Date(sorted[0].date).toISOString().slice(0, 10)
        ===
        new Date().toISOString().slice(0, 10)
      )
    );

    return [streak, hasDoneToday];
  }, [habit]);

  const editHabit = (options: EditHabitOptions) => {
    let newHabit = habit;
    newHabit.title = options.title ?? habit.title;
    newHabit.cue = options.cue ?? habit.cue;
    newHabit.craving = options.craving ?? habit.craving;
    newHabit.response = options.response ?? habit.response;
    newHabit.reward = options.reward ?? habit.reward;
    newHabit.notes = options.notes ?? habit.notes;
    newHabit.value = options.value ?? habit.value;
    editHabitCallback(newHabit);

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

  return (<>
    <Card
      bg={color}
      text='white'
      className='habit-card mb-2 text-left'
    >
      <Card.Header
        // The weird check in here is to prevent clicking on the top buttons
        // (finished, move up/down) from expanding the body
        onClick={e => {if (e.target === e.currentTarget) setShowBody(!showBody)}}
        role='button'
      >
        {show.includes('OTHER') && <span className='habit-streak'>
          <span
            className={
              'streak-number'
              + (hasDoneToday ? ' done-today' : ' not-done-today')  // change color if the habit has been done today
              + (habit.value === 'NEUTRAL' ? ' placeholder' : '')  // don't show if the habit is neutral, but keep the spacing
            }
          >
            {streak}
          </span>
        </span>}
        {habit.title}
        {show.includes('BUTTONS') && <HabitTopButtonGroup
          habit={habit}
          routine={routine}
          editHabit={editHabit}
          rearrangeHabitCallback={rearrangeHabitCallback}
        />}
      </Card.Header>
      {showBody && <Card.Body>
        {show.includes('COMPONENTS') && <Row className='mb-2'>
          <Col xs={6} md={3}>
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
          <Col xs={6} md={3}>
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
          <Col xs={6} md={3}>
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
          <Col xs={6} md={3}>
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
          <hr />
        </Row>}
        {show.includes('NOTES') && <Row>
          <Col xs={12} md={habit.value === 'NEUTRAL' ? 12 : 6}>
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
          {habit.value !== 'NEUTRAL' && <Col xs={12} md={6}>
            <p>Strategies to {habit.value === 'POSITIVE' ? 'build' : 'break'} this habit:</p>
            {habit.value === 'POSITIVE' ? <ul>
              <li>
                How can I make it obvious?{' '}
                <QuestionBubble isWhite>
                  Design your environment in a way that makes the cues of this habit obvious and visible.{' '}
                  For example, promise to study for an hour (action) in your room (place) every evening after you finish your homework (time).
                  If you are specific like this example, you are more likely to actually follow through with your intentions.
                  Hint: look at your habit's cue.
                </QuestionBubble>
              </li>
              <li>
                How can I make it attractive?{' '}
                <QuestionBubble isWhite>
                  Highlight the benefits of doing your good habit regularly.
                  For example, list out the benefits of studying everyday to clarify your motivation.
                  Another option is to join a group of people who also want to build the same habit, such as a study-group.
                  You can also "bundle" your good habit with something you naturally enjoy doing, like listening to an audiobook/podcast as you clean your room.
                  Hint: look at your habit's craving.
                </QuestionBubble>
              </li>
              <li>
                How can I make it easy?{' '}
                <QuestionBubble isWhite>
                  When you first start building study habits, you can start with ridiculously tiny habits, like just studying for a single minute or doing a single flashcard.
                  These tiny habits give you no excuse to not do them, and you can slowly build them into larger habits.
                  You can't improve a habit you don't have, so start small.
                </QuestionBubble>{' '}
                <QuestionBubble isWhite>
                  Change your environment to decrease your good habit's friction and make it easier to complete.
                  For example, keep study materials at arms reach so that there's little friction between you and studying, while keeping distractions (like your phone) in another room.
                  Hint: look at your habit's response.
                </QuestionBubble>
              </li>
              <li>
                How can I make it satisfying?{' '}
                <QuestionBubble isWhite>
                  Give yourself a reward for completing your good habit.
                  For example, if you can study without distractions for a 25 minutes, give yourself 5 minutes of freedom (or longer intervals, if you'd like).
                  Hint: look at your habit's reward.
                </QuestionBubble>
              </li>
            </ul> : <ul>
              <li>
                How can I make it invisible?{' '}
                <QuestionBubble isWhite>
                  Design your environment in a way that reduces exposure to this habit and makes its cues invisible.{' '}
                  For example, disable notifications or move your phone to another room.
                  Hint: look at your habit's cue.
                </QuestionBubble>
              </li>
              <li>
                How can I make it unattractive?{' '}
                <QuestionBubble isWhite>
                  Highlight the benefits of avoiding your bad habit.
                  For example, make a list of benefits you would gain from avoiding social media, like having more time and energy available.
                  Hint: look at your habits craving.
                </QuestionBubble>
              </li>
              <li>
                How can I make it difficult?{' '}
                <QuestionBubble isWhite>
                  Change your environment to increase your bad habit's friction and make it more difficult.
                  For example, install an app/<a href='https://chrome.google.com/webstore/detail/self-control/ncaaipdfhdijmfdfmeoagmogddhkfdec?hl=en' target='_blank' rel='noreferrer'>browser-extension</a> that stops you from accessing an app/website that you spend too much time on.
                  You could also put your phone in another room to completely avoid temptation.
                  Hint: look at your habits response.
                </QuestionBubble>
              </li>
              <li>
                How can I make it unsatisfying?{' '}
                <QuestionBubble isWhite>
                  How can you make the costs of your bad habit as unsatisfying and immediately painful as possible?
                  For example, get an "accountability partner" who has the same goal as you, and you promise to update on how well you did your bad habit.
                  Hint: look at your habits reward.
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
          <hr />
        </Row>}
        {habit.value !== 'NEUTRAL' && show.includes('OTHER') && <>
          <hr />
          <Row>
            <Col>
              Streak: {streak}
            </Col>
          </Row>
        </>}
        {show.includes('VALUES') && <Row>
          <Col sm={12} md={4}>
            <ButtonGroup className='w-100' toggle>
              {['POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((value, i) => (
                <ToggleButton
                  key={i}
                  type='radio'
                  variant={['success', 'primary', 'danger'][i]}
                  name='radio'
                  value={value}
                  className='mt-2 w-100'
                  id={`${value.toLowerCase()}-btn`}
                  checked={habit.value === value}
                  onChange={(e) => editHabit({ value: e.currentTarget.value as HabitValue })}
                >
                  {value[0] + value.slice(1).toLowerCase()}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </Col>
          <Col sm={0} md={4} />
          <Col sm={12} md={4}>
            <HabitBottomButtonGroup
              routine={routine}
              habit={habit}
              deleteHabitCallback={deleteHabitCallback}
              rearrangeHabitCallback={rearrangeHabitCallback}
              editHabit={editHabit}
            />
          </Col>
          <Col className='text-center' md={12}>
            <Button
              onClick={() => setShowBody(false)}
              style={{ width: '100px' }}
              variant='secondary'
              className='mt-2 mx-auto'
            >
              Close
            </Button>
          </Col>
        </Row>}
      </Card.Body>}
    </Card>
  </>);
}