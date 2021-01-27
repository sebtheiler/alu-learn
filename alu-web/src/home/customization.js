import React, { useState } from 'react';
import { Button, ButtonGroup, Form } from 'react-bootstrap';
import { apiProfileSettingsUpdate } from '../lookup';
import { errorHandler } from '../utils';


export function UserCustomization(props) {
  const [slideNum, setSlideNum] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleBack = event => {
    event.preventDefault();
    setSlideNum(slideNum - 1);
  }

  const handleNext = event => {
    event.preventDefault();
    setSlideNum(slideNum + 1);

    switch (slideNum) {
      case 0:
        setAnswers({
          ...answers,
          user_type: event.target.userType.value,
        });
        break;
      case 1:
        setAnswers({
          ...answers,
          ideal_time_per_day: event.target.timeSpent.value,
        });
        break;
      case 2:
        const newAnswers = {
          ...answers,
          send_reminders: event.target.reminders.value === 'YES',
        }; // need this because state update doesn't happen until after the API call below is ran
        setAnswers(newAnswers);
        apiProfileSettingsUpdate(newAnswers, (response, status) => {
          if (status === 200) {
            // pass
          } else {
            // Error setting user preferences
            errorHandler(response, status, 3021);
          }
        });
        break;
      default:
        return;
    }
  }

  const slides = [
    (<>
      <p>I am a</p>
      <Form.Control
        as='select'
        name='userType'
        custom
      >
        <option value='STUDENT'>Student/Learner</option>
        <option value='TEACHER'>Teacher/Parent</option>
      </Form.Control>
      <br />
    </>),
    (<>
      <p>I want to spend</p>
      <Form.Control
        as='select'
        name='timeSpent'
        custom
      >
        <option value='MAX'>as long as it takes</option>
        <option value='20'>20 minutes</option>
        <option value='15'>15 minutes</option>
        <option value='10'>10 minutes</option>
        <option value='5'>5 minutes</option>
      </Form.Control>
      <p>per day studying</p>
    </>),
    (<>
      <p>Would you like to be reminded if you forget to study?</p>
      <p>
        Studying is most effective when it's done every day.{' '}
        Alu can send reminder emails to help you build your study habits.
      </p>
      <Form.Control
        as='select'
        name='reminders'
        custom
      >
        <option value='YES'>Yes, send me reminder emails to help me build study habits</option>
        <option value='NO'>No, I'm not interested in reminder emails</option>
      </Form.Control>
    </>),
  ]

  return (<div className='container-fluid'>
    <p>
      To help personalize Alu to your needs, please answer a few short questions<br />
      <small>You can always change your answers in Settings</small>
    </p>
    {slideNum < slides.length ? <div>
      <Form onSubmit={handleNext}>
        {slides[slideNum]}
        <ButtonGroup className='mt-3'>
          {slideNum > 0 && <Button variant='secondary' onClick={handleBack}>Previous</Button>}
          <Button className='ml-1' type='submit'>Next</Button>
        </ButtonGroup>
      </Form>
    </div> : <>
      <p>Alu has been personalized to fit your needs!</p>
      <Button href='/home/'>Home</Button>
    </>}
  </div>);
}
