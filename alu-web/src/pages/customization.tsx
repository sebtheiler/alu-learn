import ChoiceSelect from '../utils/ChoiceSelect';
import Container from 'react-bootstrap/Container';
import ProgressBar from '../utils/ProgressBar';
import { useState } from 'react';
import { backendFetch } from '../lookup/lookup';


export default function UserCustomization({ isProFromOrg }) {
  const [slideNum, setSlideNum] = useState(0);
  const [answers, setAnswers] = useState<any>({
    timezone: new Date().getTimezoneOffset(),
  });

  const handleNext = (question: string | null) => {
    return async (response: any) => {
      let newAnswers = answers;
      if (question) newAnswers[question] = response;
      setAnswers(newAnswers);

      if (slideNum === slides.length - 1) {
        await backendFetch(
          'POST', 'pages/welcome-info/', answers,
        ).then(() => {
          if (answers.deckChoice === 'CREATE_OWN')
            window.location.replace('/home/')
          else
            window.location.replace('/explore/')
        });
      } else {
        setSlideNum(slideNum + 1);
      }
    }
  }

  const slides = [
    (<>
      <h4>Are you a student or a teacher?</h4>
      <ChoiceSelect choices={[
        { value: 'STUDENT', display: 'Student', icon: 'fa-solid fa-graduation-cap', iconColor: 'dodgerblue' },
        { value: 'TEACHER', display: 'Teacher', icon: 'fa-solid fa-person-chalkboard', iconColor: 'indigo' },
      ]} onClick={handleNext('userType')} />
    </>),
    (<>
      <h4>How did you hear about Alu?</h4>
      <ChoiceSelect choices={[
        { value: 'FRIENDS', display: 'Friends/Family', icon: 'fa-solid fa-user-group', iconColor: 'orange' },
        { value: 'TEACHER', display: 'Teacher', icon: 'fa-solid fa-person-chalkboard', iconColor: 'indigo' },
        { value: 'INSTA', display: 'Instagram', icon: '/static/images/instagram-logo.svg' },
        { value: 'REDDIT', display: 'Reddit', icon: 'fa-brands fa-reddit' },
        { value: 'TIKTOK', display: 'TikTok', icon: 'fa-brands fa-tiktok' },
        { value: 'YOUTUBE', display: 'YouTube', icon: 'fa-brands fa-youtube' },
        { value: 'NEWS', display: 'News', icon: 'fa-solid fa-newspaper', iconColor: 'royalblue' },
        { value: 'SEARCH', display: 'Web Search', icon: '/static/images/google-logo.svg' },
      ]} onClick={handleNext('referrer')} shuffle includeOther />
    </>),
    (<>
      <h4>Why did you join Alu?</h4>
      <ChoiceSelect choices={[
        { value: 'MEMORY', display: 'I want to memorize more of what I learn' },
        { value: 'GRADES', display: 'I want to improve my grades' },
        { value: 'CONCEPT', display: 'I think it\'s an interesting concept' },
        { value: 'TEACHER', display: 'My teacher told me to' },
      ]} onClick={handleNext('joinReason')} shuffle />
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
      <h4>Would you like to create your own deck or copy an existing deck?</h4>
      <ChoiceSelect choices={[
        { value: 'CREATE_OWN', display: 'Create My Own', icon: 'fa-solid fa-plus', iconColor: 'navy' },
        { value: 'COPY_EXISTING', display: 'Copy Existing Deck', icon: 'fa-solid fa-window-restore', iconColor: 'peru' },
      ]} onClick={handleNext('deckChoice')} />
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
