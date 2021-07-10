import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { CreateHabitButton } from './buttons';
import { Routine, Habit } from './types';
import { FormCheckbox, setCookie } from '../utils';
import { RenderHabit } from './habit';
import { Form } from 'react-bootstrap';

const introSlides = [
  (<>
    <h1>Welcome to <em>Habits!</em></h1>
    <p>Habits control our lives.  How can we control our habits?</p>
  </>),
  (<>
    <h1>Good Habits &amp; Bad Habits</h1>
    <p>Good habits let us do hard work even when we don't want to, and give us the freedom to spend time how we want to</p>
    <p>Bad habits make us waste time on meaningless activities, and drain energy we could've spent doing what we enjoy</p>
    <br />
    <p>Everything from studying, to procrastinating, to brushing your teeth can be a habit (hopefully the last one already is)</p>
  </>),
  (<>
    <h1>What is <em>Habits?</em></h1>
    <p>Alu's <em>Habits</em> is a system based on behavioral and cognitive psychology, that makes building good habits and breaking bad habits easier</p>
    <p>It breaks down habits into key components that you can individually perfect</p>
    <p>This allows you to control which habits you build or break, giving you more control over your life</p>
  </>),
  (<>
    <h1>Security &amp; Privacy</h1>
    <p>Your habits are personal information about yourself.  If you use <em>Habits</em>, you will voluntarily be sharing these with Alu</p>
    <p>This information will absolutely never be looked at by anyone, nor will it ever be given to any third parties*</p>
    <p>You can review the <a href='/legal/privacy-policy/'>Privacy Policy</a> for more information</p>
    <small className='text-secondary'>*Unless you specifically request we do so, or we are required by law (incredibly unlikely)</small>
    <br />
  </>),
  (<>
    <h1>Get Started?</h1>
    <p><em>Habits</em> isn't a panacea, but if you want to make meaningful changes to your habits, it's for you!</p>
    <p>It only takes a couple minutes to get started, so why not now?</p>
    <hr />
    <p><strong>
      Note: <em>Habits</em> is still in Beta!  It is better than nothing but there are still plenty of improvements to be made!<br />
      It also currently is not designed to work with mobile, please use a laptop or desktop.
    </strong></p>
  </>),
];
interface SlidesPlayerProps {
  finishedCallback(): void;
}
export function SlidesPlayer(props: SlidesPlayerProps) {
  const { finishedCallback } = props;
  const [slideNum, setSlideNum] = useState(0);

  return (<>
    {introSlides[slideNum]}
    {slideNum > 0 && <Button
      onClick={() => setSlideNum(slideNum - 1)}
      variant='secondary'
      className='mt-5 float-left'
    >
      Back
    </Button>}
    <Button
      onClick={() => slideNum < introSlides.length - 1 ? setSlideNum(slideNum + 1) : finishedCallback()}
      className='mt-5 mr-auto text-center'
      style={{ width: '200px', transform: slideNum > 0 ? 'translateX(-27px)' : '' }}
      variant='info'
      id='next-btn'
    >
      {slideNum < introSlides.length - 1 ? 'Next' : 'Get Started'}
    </Button>
  </>);
}

interface SetupTutorialProps {
  routine: Routine;
  createHabitCallback(habit: Habit): void;
  editHabitCallback(habit: Habit): void;
  deleteHabitCallback(habitId: number): void;
  rearrangeHabitCallback(habitId: number, direction: 'UP' | 'DOWN'): void;
  finishedCallback(): void;
}
export function SetupTutorial(props: SetupTutorialProps) {
  const { createHabitCallback, editHabitCallback, deleteHabitCallback, rearrangeHabitCallback, routine, finishedCallback } = props;
  const [slideNum, setSlideNum] = useState(0);
  const [chosenHabits, setChosenHabits] = useState<Habit[]>([]);
  if (!routine) return null;

  const completedEnough = (attr: 'cue' | 'notes') => (
    routine.habits.filter(
      h => chosenHabits.map(
        ch => ch.id
      ).includes(h.id) && (h[attr] || '').length > 0
    ).length >= chosenHabits.length - 1
  )

  const slides = [
    (<>
      <h1>Adding Habits</h1>
      <p>Now we are going to fill "{routine.title}" with some habits</p>
      <p>Look at the example, then use the input below to create habits</p>
      <br />
      {routine.habits.map((habit, i) =>
        <RenderHabit
          routine={routine}
          habit={habit}
          editHabitCallback={editHabitCallback}
          rearrangeHabitCallback={rearrangeHabitCallback}
          deleteHabitCallback={deleteHabitCallback}
          key={`${routine.id}-${habit.id}`}
          show={[]}
        />
      )}
      <CreateHabitButton
        createHabitCallback={createHabitCallback}
        routineId={routine.id}
      />
      <br />
      {routine.habits.length > 3 && <Button
        onClick={() => setSlideNum(slideNum + 1)}
        variant='info'
      >
        I'm Finished
      </Button>}
      <br />
      <hr />
      <p>Example:</p>
      <img
        src='/static/images/basic-routine.png'
        alt='An example routine: Wake up; Turn on computer; Check social media; Eat breakfast; Watch YouTube; Study with Alu; Start School'
        width='100%'
      />
    </>),
    (<>
      <h1>Positive/Neutral/Negative</h1>
      <p>Decide whether each of these habits are good, bad, or neutral.</p>
      <p>Click on them and use the three buttons to label the habits</p>
      <p>(you can click the habit again to close it)</p>
      <br />
      {routine.habits.map((habit, i) =>
        <RenderHabit
          routine={routine}
          habit={habit}
          editHabitCallback={editHabitCallback}
          rearrangeHabitCallback={rearrangeHabitCallback}
          deleteHabitCallback={deleteHabitCallback}
          key={`${routine.id}-${habit.id}`}
          show={['VALUES']}
        />
      )}
      {routine.habits.filter(habit => habit.value !== 'NEUTRAL').length >= 3 && <Button
        onClick={() => setSlideNum(slideNum + 1)}
        variant='info'
      >
        I'm Finished
      </Button>}
      <br />
      <hr />
      <p>Example:</p>
      {/* TK TODO: proper image */}
      <img
        src='/static/images/basic-routine.png'
        alt='An example routine: Wake up; Turn on computer; Check social media; Eat breakfast; Watch YouTube; Study with Alu; Start School'
        width='100%'
      />
    </>),
    (<>
      <h1>Add New Good Habits</h1>
      <p>Nice!  Now add some (1-3) good habits that you would like to build</p>
      <p>Then label these habits as positive and <strong>rearrange them using the up/down arrows</strong></p>
      {routine.habits.map(habit =>
        <RenderHabit
          routine={routine}
          habit={habit}
          editHabitCallback={editHabitCallback}
          rearrangeHabitCallback={rearrangeHabitCallback}
          deleteHabitCallback={deleteHabitCallback}
          key={`${routine.id}-${habit.id}`}
          show={['VALUES', 'BUTTONS']}
        />
      )}
      <CreateHabitButton
        createHabitCallback={createHabitCallback}
        routineId={routine.id}
      />
      <br />
      {routine.habits.length > 3 && <Button
        onClick={() => setSlideNum(slideNum + 1)}
        variant='info'
      >
        I'm Finished
      </Button>}
    </>),
    (<>
      <h1>Habit Components</h1>
      <p>Nice!  Here's the part where we start breaking habits down into their core components.</p>
      <p>These components are:</p>
      {/* TK TODO: center the bullets */}
      <ul>
        <li>Cue: the trigger your brain receives to start a certain habit</li>
        <li>Craving: the reason you are motivated to do this habit</li>
        <li>Response: the behavior you do to perform this habit</li>
        <li>Reward: the positive feeling you get for completing the habit</li>
      </ul>
      <p>A cue triggers a craving, which motivates a response resulting in a reward.</p>
      <Button
        onClick={() => setSlideNum(slideNum + 1)}
        variant='info'
      >
        Makes Sense
      </Button>
    </>),
    (<>
      <h1>Choose Habits to Improve</h1>
      <p>Choose a couple of habits you've created that you want to focus on building or breaking</p>
      <Form onSubmit={event => {
        event.preventDefault();
        const newChosenHabits = routine.habits.filter(h => Array.from(document.forms['select-habits'].elements['habits']).filter(
          (e: any) => e.checked
        ).map(
          (e: any) => parseInt(e.value)
        ).includes(h.id)
        );
        setChosenHabits(newChosenHabits);

        if (newChosenHabits.length === 0) {
          const selectHabitsError = document.getElementById('select-habits-error');
          if (!selectHabitsError) return;
          selectHabitsError.innerText = 'You must select at least one habit to work on building/breaking';
          return;
        }

        setSlideNum(slideNum + 1);
      }} name='select-habits'>
        {routine.habits.map((habit, i) => habit.value !== 'NEUTRAL' && <React.Fragment key={i}>
          <FormCheckbox name='habits' value={habit.id.toString()}>
            {habit.title}
          </FormCheckbox><br />
        </React.Fragment>)}
        <Button
          type='submit'
          variant='info'
          className='mt-3'
        >
          I'm Finished
        </Button>
        <p id='select-habits-error' className='text-danger mt-2' />
      </Form>
    </>),
    (<>
      <h1>Identify Core Components</h1>
      <p>Now, click on each habit you chose to expand it.  Then use your knowledge of the components to identify its components.</p>
      <p>If you get stuck, hover the question icon for more details and examples</p>
      {chosenHabits.map(habit =>
        <RenderHabit
          routine={routine}
          habit={habit}
          editHabitCallback={editHabitCallback}
          rearrangeHabitCallback={rearrangeHabitCallback}
          deleteHabitCallback={deleteHabitCallback}
          key={`${routine.id}-${habit.id}`}
          show={['VALUES', 'BUTTONS', 'COMPONENTS']}
        />
      )}
      {completedEnough('cue') &&
        <Button
          onClick={() => setSlideNum(slideNum + 1)}
          variant='info'
        >
          I'm Finished
        </Button>
      }
    </>),
    (<>
      <h1>Notes &amp; Strategies</h1>
      <p>Almost done!  With these four components, expand the habits again and, in the "Notes" section, try to answer some of questions on the right side</p>
      <p>If you get stuck, hover the question icon for more details and examples</p>
      {chosenHabits.map(habit =>
        <RenderHabit
          routine={routine}
          habit={habit}
          editHabitCallback={editHabitCallback}
          rearrangeHabitCallback={rearrangeHabitCallback}
          deleteHabitCallback={deleteHabitCallback}
          key={`${routine.id}-${habit.id}`}
          show={['VALUES', 'BUTTONS', 'COMPONENTS', 'NOTES']}
        />
      )}
      {completedEnough('notes') &&
        <Button
          onClick={() => setSlideNum(slideNum + 1)}
          variant='info'
        >
          I'm Finished
        </Button>
      }
    </>),
    (<>
      <h1>What next?</h1>
      <p>Congratulations!  You've just started changing your habits! What next?</p>
      <ul>
        <li>After completing a good habit, or avoiding a bad one, you can <strong>mark it as finished by clicking the circle icon on its right</strong>.  This will reset every day.</li>
        <li>If you want to build/break more habits in this routine, you can fill out their four components and try to answer some strategies for them.</li>
        <li>If you want to work on a different set of habits, you can create a different routine (e.g., one for the evening).</li>
        <li>Outside of just routines, you can also have more general habits, such as checking social media when you're stuck.</li>
      </ul>
      <Button
        onClick={() => setSlideNum(slideNum + 1)}
        variant='info'
      >
        Got it!
      </Button>
    </>),
    (<>
      <h1>Conclusion</h1>
      <p>You've learned everything you needed to know from this tutorial</p>
      <p>After this, you'll be introduced to the real habits page.  It's essentially the same as everything you've just done, but all put together.</p>
      <hr />
      <p>Changing habits isn't instant, and that can be frustrating.  But if you follow the strategies in Alu and give it enough dedication, it will happen.</p>
      <p><strong>Mark habits as completed/avoided every day, and continue to use the four components + strategies to build/break those habits.</strong></p>
      <p><em>Habits</em> gives you a framework to help modify your habits.  Use that in any way you wish!</p>
      <hr/>
      <p>The book <em><a href='https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299' target='_blank' rel='noopener noreferrer'>Atomic Habits</a></em> by James Clear has inspired a lot of the content here and is a great read if you want to learn more about habits.</p>
      <Button
        onClick={finishedCallback}
        variant='info'
      >
        Finish
      </Button>
    </>),
  ];

  return <div>
    {slides[slideNum]}
    <br />
    {slideNum > 0 && <Button
      onClick={() => setSlideNum(slideNum - 1)}
      className='float-left'
      variant='secondary'
    >
      Back
    </Button>}
  </div>;
}

const walkthroughTutorialParts = ['setup', 'values', 'habit-parts', 'strategies', 'final'];
interface WalkthroughProps {
  tutorialPart: number;
  showTutorial: boolean;
increaseTutorialPart?(): void;
}
export function WalkthroughText(props: WalkthroughProps) {
  const { tutorialPart, showTutorial, increaseTutorialPart } = props;

  if (!showTutorial || tutorialPart >= walkthroughTutorialParts.length) return null;
  return (<>
    <p>
      {walkthroughTutorialParts[tutorialPart] === 'setup' && <>
        Great!  Now we are going to fill this routine with a couple habits. Create a habit using the input.<br />
        (example below)
      </>}
      {walkthroughTutorialParts[tutorialPart] === 'values' && <>
        Now, click on each of the habits and assign it a value: positive/neutral/negative.
        This represents whether the habit is good (positive) or bad (negative).<br />
        (example below)
      </>}
      {walkthroughTutorialParts[tutorialPart] === 'habit-parts' && <>
        As you might've seen when assigning values, there are are four components that influence a habit.
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
      {walkthroughTutorialParts[tutorialPart] === 'strategies' && <>
        Almost done!  With these four components, you can try to answer the some strategies that will help you build/break the habit.
        <br /><br />
        These strategies are built on the four components and will help you turn your habit change into action.
        (don't forget you can hover the question bubbles for more info)
      </>}
      {walkthroughTutorialParts[tutorialPart] === 'final' && <>
        There you go!  You've just started changing your habits!  What next?<br /><br />
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
    <Button
      className='mb-3 mx-auto text-center'
      id='next-btn'
      onClick={() => {
        if (increaseTutorialPart) increaseTutorialPart();

        // If this is the last part, mark the tutorial as finished
        if (tutorialPart === walkthroughTutorialParts.length - 1)
          setCookie('finishedTutorial', 'true', 30);
      }}
    >
      I'm Finished
    </Button>
    <hr />
  </>);
}

export function WalkthroughImage(props: WalkthroughProps) {
  const { showTutorial, tutorialPart } = props;

  const images = [
    {
      src: '/static/images/basic-routine.png',
      alt: 'An example routine: Wake up; Turn on computer; Check social media; Eat breakfast; Watch YouTube; Study with Alu; Start School',
    },
    {
      src: '/static/images/values-routine.png',
      alt: 'An example routine, annotated with values',
    },
    {
      src: '/static/images/habit-components.png',
      alt: 'Two example habits, annotated with each of their four components',
    },
    {
      src: '/static/images/habit-strategies.png',
      alt: 'Two example habits, annotated with strategies to build/break them',
    },
  ];
  
  if (!showTutorial || tutorialPart >= images.length - 1) return null;
  return (<>
    <p>Example:</p>
    <img
      src={images[tutorialPart].src}
      alt={images[tutorialPart].alt}
      width='100%'
    />
  </>);
}
