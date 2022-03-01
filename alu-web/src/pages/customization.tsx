import Button from 'react-bootstrap/Button';
import ChoiceSelect from '../utils/ChoiceSelect';
import Container from 'react-bootstrap/Container';
import LoadingButton from '../decks/buttons/LoadingButton';
import ProgressBar from '../utils/ProgressBar';
import TZSelect from '../utils/timezone';
import { useState } from 'react';
import { backendFetch } from '../lookup/lookup';


export default function UserCustomization() {
  const [slideNum, setSlideNum] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleNext = (question: string | null) => {
    return async (response: any) => {
      let newAnswers = answers;
      if (question) newAnswers[question] = response;
      setAnswers(newAnswers);

      if (slideNum === slides.length - 1) {
        await backendFetch(
          'POST', 'analytics/collect-welcome-info/', answers,
        ).then(() => window.location.replace('/home/'));
      } else {
        setSlideNum(slideNum + 1);
      }
    }
  }

  const slides = [
    (<>
      <h4>Are you a student or a teacher?</h4>
      <ChoiceSelect choices={[
        { value: 'STUDENT', display: 'Student' },
        { value: 'TEACHER', display: 'Teacher' },
      ]} onClick={handleNext('userType')} />
    </>),
    (<>
      <h4>How did you hear about Alu?</h4>
      <ChoiceSelect choices={[
        { value: 'FRIENDS', display: 'Friends/Family' },
        { value: 'TEACHER', display: 'Teacher' },
        { value: 'SOCIAL', display: 'Social Media' },
        { value: 'YOUTUBE', display: 'YouTube' },
        { value: 'NEWS', display: 'News/article/blog' },
        { value: 'SEARCH', display: 'Web Search' },
        { value: 'OTHER', display: 'Other' },
      ]} onClick={handleNext('referrer')} />
    </>),
    (<>
      <h4>Why did you join Alu?</h4>
      <ChoiceSelect choices={[
        { value: 'MEMORY', display: 'I want to memorize more of what I learn' },
        { value: 'GRADES', display: 'I want to improve my grades' },
        { value: 'CONCEPT', display: 'I think it\'s an interesting concept' },
        { value: 'TEACHER', display: 'My teacher told me to' },
      ]} onClick={handleNext('joinReason')} />
    </>),
    (<>
      <h4>What is your goal number of flashcards per day?</h4>
      <ChoiceSelect choices={[
        { value: 10, display: '10 flashcards' },
        { value: 25, display: '25 flashcards' },
        { value: 50, display: '50 flashcards' },
        { value: 100, display: '100 flashcards' },
      ]} onClick={handleNext('targetFlashcards')} />
    </>),
    (<>
      <h4>Would you like a reminder email if you forget to study?</h4>
      <p>
        Studying is most effective when it's done every day.{' '}
        Alu can send reminder emails to help you build your study habits.
        <br />
        You can unsubscribe at any time in the settings.  We will never spam you.
      </p>
      <ChoiceSelect choices={[
        { value: true, display: 'Yes, send me reminder emails' },
        { value: false, display: 'No, I\'m not interested in reminder emails'},
      ]} onClick={handleNext('sendReminders')} />
    </>),
    (<>
      <h4>What timezone are you in?</h4>
      <p>This is used to keep track of your streak</p>
      <TZSelect />
      <Button
        onClick={() => {
          const tzSelect = document.getElementsByName('timezone')[0] as HTMLFormElement;
          const tz = tzSelect.value;
          handleNext('timezone')(tz);
        }}
        className='mt-3'
        block
      >
        Confirm
      </Button>
    </>),
    (<>
      <h4>Pro-mode for free!</h4>
      {/* TODO: make lifetime with correct organization */}
      <p>
        You now have access to Alu's upgraded pro-mode for a week, <strong>no credit card required.</strong>{' '}
        You can extend your subscription any time for <a href='/pro/'>$3/mo or $30/yr</a>.
      </p>
      <LoadingButton clickFunc={handleNext(null)}>Awesome!</LoadingButton>
    </>),
  ];

  return (
    <Container className='mt-5'>
      <h1 className='text-center'>Welcome to Alu!</h1>
      <ProgressBar stepNum={slideNum} totalNumSteps={slides.length - 1} />
      <br />
      <div>
        {slides[slideNum]}
      </div>
    </Container>
  );
}
