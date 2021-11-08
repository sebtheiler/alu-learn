import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import { apiProfileSettingsUpdate } from '../lookup';
import { errorHandler } from '../utils';
import { useState } from 'react';


export default function UserCustomization() {
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
          target_num_cards: event.target.targetNumCards.value,
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
        <option value='STUDENT'>Student</option>
        <option value='TEACHER'>Teacher</option>
      </Form.Control>
      <br />
    </>),
    (<>
      <p>My goal is to do…</p>
      <Form.Control
        type='number'
        name='targetNumCards'
        defaultValue={20}
        min={5}
        max={200}
        step={5}
      />
      <p>flashcards per day</p>
    </>),
    (<>
      <p>Would you like to be reminded if you forget to study?</p>
      <p>
        Studying is most effective when it's done every day.{' '}
        Alu can send reminder emails to help you build your study habits.
        <br />
        <small className='text-center'>You can unsubscribe at any time in the settings.  Alu will never spam you.</small>
      </p>
      <Form.Control
        as='select'
        name='reminders'
        custom
      >
        <option value='YES'>Yes, send me reminder emails</option>
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
          <Button className='ml-1' type='submit' id='next-btn'>
            Next
          </Button>
        </ButtonGroup>
      </Form>
    </div> : <>
      <p>Alu has been personalized to fit your needs!</p>
      <Button href='/home/'>Home</Button>
    </>}
  </div>);
}
