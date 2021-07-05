import React, { useState, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { CreateRoutineButton } from './buttons';
import { Routine } from './types';

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
    <p><em>Habits</em> isn't a miracle, but if you want to make meaningful changes to your habits (and your life), it's for you!</p>
    <p>It only takes a couple minutes to get started, so why not start now?</p>
    <hr />
    <p><strong>
      Note: <em>Habits</em> is still in Beta!  It is better than nothing but there are still plenty of improvements to be made!<br />
      It also currently is not designed to work with mobile, please use a laptop or desktop.
    </strong></p>
  </>),
];

interface SlidesPlayerProps {
  preset: 'intro';
  finishedCallback(): void;
}
export function SlidesPlayer(props: SlidesPlayerProps) {
  const { preset, finishedCallback } = props;
  const slides = useMemo(() => {
    switch (preset) {
      case 'intro':
        return introSlides;
      default:
        return [];
    }
  }, [preset]);
  const [slideNum, setSlideNum] = useState(0);

  return (<>
    {slides[slideNum]}
    {slideNum > 0 && <Button
      onClick={() => setSlideNum(slideNum - 1)}
      variant='secondary'
      className='mt-5 float-left'
    >
      Back
    </Button>}
    <Button
      onClick={() => slideNum < slides.length - 1 ? setSlideNum(slideNum + 1) : finishedCallback()}
      className='mt-5 mr-auto text-center'
      style={{ width: '200px', transform: slideNum > 0 ? 'translateX(-27px)' : '' }}
    >
      {slideNum < slides.length - 1 ? 'Next' : 'Get Started'}
    </Button>
  </>);
}

interface SetupTutorialProps {
  createRoutineCallback(routine: Routine): void;
}
export function SetupTutorial(props: SetupTutorialProps) {
  const { createRoutineCallback } = props;

  return (<>
    <h1>Setup</h1>
    <p>Great!  I'm glad you decided to use <em>Habits!</em></p>
    <p>Habits are organized into routines, which makes it easier to group similar ones together</p>
    <p>To get started, create a routine below (maybe you want to call it "Morning")</p>
    <CreateRoutineButton createRoutineCallback={createRoutineCallback} />
  </>);
}
