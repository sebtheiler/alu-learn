import React, { useState, useEffect, useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Alert from 'react-bootstrap/Alert';
import { apiClassroomStudentJoin, apiProfileDetail, apiProfileFriends, apiProfileHistory, apiClassroomsStudentJoined, apiClassroomsHomepage, apiStudentAssignmentsList, apiDeckQuickList, apiFeedbackGetQuestion, apiFeedbackRespondQuestion } from '../lookup';
import { errorHandler, shiftDate, range, timezoneToISOString, useApiObjectHook, stringDate } from '../utils';
import { randomTip } from './randomtips';
import CalendarHeatmap from 'react-calendar-heatmap';
import ReactTooltip from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import './home.css';
import { MinifiedProfile, Profile, ProfileHistory } from '../profiles/types';
import { Classroom, ClassroomAssignments } from '../teachers/types';
import { ClassroomDefaultButtonGroup, ClassroomEditCreateButton } from '../teachers/buttons';
import Likert from 'react-likert-scale';

export function HomeComponent({ username }) {
  const [profile] = useApiObjectHook<Profile>(apiProfileDetail, 200, 3010, [username]);
  const [joinClassModalIsOpen, setJoinClassModalIsOpen] = useState(false);

  return (<Container fluid>
    <Row>
      <Col
        xs={12}
        md={2}
        id='home-nav-sidebar'
        className='mt-3'
      >
        <ul className='no-bullets pl-0'>
          {profile?.settings.user_type !== 'TEACHER' && <>
            <li>
              <ClassroomsComponent
                joinClassModalIsOpen={joinClassModalIsOpen}
                setJoinClassModalIsOpen={setJoinClassModalIsOpen}
              />
            </li>
            <hr />
          </>}
          <li>
            <h4>
              <a href='/home/decks/' id='decks-link'>
                <i className='fas fa-window-restore'></i>{' '}
                Decks
              </a>
            </h4>
          </li>
          {profile && profile.settings.is_opted_dev && <li>
            <h4>
              <a href='/home/habits/' id='habits-link'>
                <i className='fas fa-seedling'></i>{' '}
                Habits (beta)
              </a>
            </h4>
          </li>}
          <hr />
          <li>
            <FriendsComponent />
          </li>
        </ul>
      </Col>
      <Col
        xs={12}
        md={10}
        id='home-main'
      >
        <FeedbackComponent />
        {profile?.settings.user_type === 'TEACHER' ?
          <TeacherClassesComponent />
        :
          <AssignmentsComponent setJoinClassModalIsOpen={setJoinClassModalIsOpen} />
        }
      </Col>
    </Row>
    {profile?.settings.user_type !== 'TEACHER' && <Row>
      <Col className='px-0'>
        <StatsComponent profile={profile} />
      </Col>
    </Row>}
  </Container>);
}


function ClassroomsComponent({ joinClassModalIsOpen, setJoinClassModalIsOpen }) {
  const [showClassrooms, setShowClassrooms] = useState(false);
  const [classrooms] = useApiObjectHook<Classroom[]>(
    apiClassroomsStudentJoined,
    200, 8005,
    [], null, null,
    showClassrooms,
  );

  const handleJoinClass = event => {
    event.preventDefault();
    const form = event.target;

    apiClassroomStudentJoin(form.elements.classCode.value, (response, status) => {
      const joinClassError = document.getElementById('join-class-error');
      if (status === 200) {
        if (joinClassError) joinClassError.innerText = '';
        window.location.reload();
      } else if (status === 404) {
        if (!joinClassError) return;

        if (response.message === 'Classroom not found') {
          joinClassError.innerText = 
            'That class doesn\'t exist.  Please make sure you\'ve typed in the code correctly';
        } else if (response.message === 'You may only join classes in the same domain') {
          joinClassError.innerText = 
            'You may only join classes from a teacher than has the same email domain as you.';
        }
      } else {
        // Error joining class
        errorHandler(response, status, 8004);
      }
    });
  }

  return (<>
    <Button onClick={() => setJoinClassModalIsOpen(true)} className='mb-3' id='join-class-btn'>
      Join New Class
    </Button>
    <h4>
      <span onClick={() => setShowClassrooms(!showClassrooms)} className='link-like' id='classes-dropdown'>
        <i className='fas fa-graduation-cap'></i>{' '}
        Classes
        {showClassrooms ?
          <i className='fas fa-caret-up ml-2'></i>
        :
          <i className='fas fa-caret-down ml-2'></i>
        }
      </span>{' '}
    </h4>
    <Modal show={joinClassModalIsOpen} onHide={() => setJoinClassModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>Join New Class</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleJoinClass}>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor='classCode'>
              <p className='mb-0'>Class Code</p>
              <small className='text-muted'>
                Your teacher will provide you with a class code.  Please enter it here.
              </small><br />
              <small className='text-danger' id='join-class-error'></small>
            </Form.Label>
            <Form.Control
              type='text'
              name='classCode'
              maxLength={8} minLength={8}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setJoinClassModalIsOpen(false)} variant='secondary'>
            Cancel
          </Button>
          <Button type='submit' id='join-modal-btn'>
            Join!
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
    {showClassrooms && classrooms && <ul className='mb-2'>
      {classrooms.map((classroom, i) =>
        <li key={i}>
          <a href={`/classrooms/${classroom.id}/student/`} className='class-list'>
            {classroom.title}
          </a>
        </li>
      )}
    </ul>}
    {showClassrooms && classrooms && classrooms.length === 0 && <p>
      You aren't enrolled in any classes yet
    </p>}
  </>);
}


function FriendsComponent() {
  const [showFriends, setShowFriends] = useState(false);
  const [friends] = useApiObjectHook<MinifiedProfile[]>(
    apiProfileFriends,
    200,
    3011,
    [], null, null,
    showFriends,
  );

  return (<>
    <h4>
      <span onClick={() => setShowFriends(!showFriends)} className='link-like' id='friends-btn'>
        <i className='fas fa-users'></i>{' '}
        Friends
        {showFriends ?
          <i className='fas fa-caret-up ml-2'></i>
        :
          <i className='fas fa-caret-down ml-2'></i>
        }
      </span>{' '}
    </h4>
    {showFriends && friends && <ul>
      {friends.map((friend, i) =>
        <li key={i}>
          <a href={`/profiles/u/${friend.username}/`} className='friend-link'>
            {friend.username}
          </a>
        </li>
      )}
    </ul>}
    {showFriends && friends && friends.length === 0 && <p>
      You don't have any friends yet
    </p>}
  </>);
}



const today = new Date();
const blankValues = range(0, 366).map(i => {
  return {
    date: shiftDate(today, -i),
    cardsDone: 0,
    timeSpent: 0,
    habitsDone: 0,
  } as ProfileHistory;
});
const calcWorkDone = hist => {
  if (hist.cards_done !== undefined) {
    return hist.cards_done + hist.habits_done * 10;
  } else {
    return hist.cardsDone + hist.habitsDone * 10;
  }
}

function StatsComponent({ profile }) {
  const [userHistory, setUserHistory] = useState<ProfileHistory[]>(blankValues);
  const [gotHistory, setGotHistory] = useState(false);
  const [maxWorkDone, setMaxWorkDone] = useState(0);

  // Get profile history
  useEffect(() => {
    if (gotHistory === false && profile) {
      setGotHistory(true);
      apiProfileHistory(profile.username, (response, status) => {
        if (status === 200) {
          setMaxWorkDone(Math.max(...response.map(
            hist => calcWorkDone(hist),
          )));
          const gottenDates = response.map(hist => hist.date);
          const historyValues = userHistory.map(hist => {
            // Check if we have that date in history
            if (gottenDates.includes(timezoneToISOString(hist.date).slice(0, 10))) {
              // Get the date that matches
              const date = response.filter(subHist => subHist.date === timezoneToISOString(hist.date).slice(0, 10))[0];
              return {
                ...hist,
                cardsDone: date.cards_done,
                timeSpent: date.time_spent,
                habitsDone: date.habits_done,
              };
            } else {
              // Return the standard/blank value
              return hist;
            }
          });
          setUserHistory(historyValues);
        } else {
          // Error getting user history
          errorHandler(response, status, 3013);
        }
      });
    }
  }, [profile, gotHistory, setGotHistory, userHistory, setUserHistory]);

  return (
    <div className='text-center mb-3' id='home-stats'>
      <h3 className='mt-3'>Stats</h3>
      <h4>{profile?.first_name} {profile?.last_name}</h4>
      <h5 className='text-secondary'>@{profile?.username}</h5>
      <Container className='mx-auto mb-3'>
        <CalendarHeatmap
          startDate={shiftDate(today, -366)}
          endDate={today}
          values={userHistory}
          tooltipDataAttrs={(value: ProfileHistory) => {
            if (!value || !value.date)
              return {'data-tip': 'Error, please report this'};

            let dataTip = '';
            if (value.cardsDone) {
              dataTip += `You reviewed ${value.cardsDone} flashcard`;
              if (value.cardsDone > 1)
                dataTip += 's';
            }
            if (value.habitsDone) {
              if (dataTip === '')
                dataTip += `You did ${value.habitsDone} habit`;
              else
                dataTip += ` and did ${value.habitsDone} habit`;
              
                if (value.habitsDone > 1)
                  dataTip += 's';
            }
            if (dataTip !== '')
              dataTip += ` on ${stringDate()}`
            if (value.timeSpent)
              dataTip += ` in ${Math.round(value.timeSpent/1000/60)} minutes`;

            return { 'data-tip': dataTip };
          }}
          classForValue={(value) => {
            let colorValue: number;
            if (!value) {
              colorValue = 0;
            } else {
              const unit = maxWorkDone / 7; // 7 = number of colors that aren't zero
              const workDone = calcWorkDone(value);
              if (workDone === 0) {colorValue = 0} else
              if (workDone > maxWorkDone - unit*1) {colorValue = 7} else
              if (workDone > maxWorkDone - unit*2) {colorValue = 6} else
              if (workDone > maxWorkDone - unit*3) {colorValue = 5} else
              if (workDone > maxWorkDone - unit*4) {colorValue = 4} else
              if (workDone > maxWorkDone - unit*5) {colorValue = 3} else
              if (workDone > maxWorkDone - unit*6) {colorValue = 2} else
              {colorValue = 1}
            }
            return `color-scale-${Math.min(colorValue, 7)}`;
          }}
        />
        <ReactTooltip />
        Reviews today: {userHistory.sort(hist => hist.date.getTime())[0].cardsDone} |{' '}
        Time studying today: {Math.round(userHistory.sort(hist => hist.date.getTime())[0].timeSpent/1000/60)}m |{' '}
        Longest streak: {profile?.longest_streak} |{' '}
        Current streak: {profile?.current_streak}
        <div className='text-center mx-auto alert alert-info mb-3'>
          {randomTip}
        </div>
      </Container>
    </div>
  );
}


interface QuickDeck {
  title: string;
  percent_complete: number;
  id: number;
}
function AssignmentsComponent({ setJoinClassModalIsOpen }) {
  const [classrooms] = useApiObjectHook<ClassroomAssignments[]>(
    apiStudentAssignmentsList,
    200,
    8018,
  );
  const [decks] = useApiObjectHook<QuickDeck[]>(
    apiDeckQuickList,
    200,
    1029,
    [true, true],
  );

  return (<Container className='ml-0'>
    {classrooms !== undefined ? (classrooms.length > 0 ? <>
      <h1 className='ml-3 mt-3'>Assignments</h1>
      <hr />
      <ul className='no-bullets'>
        {classrooms.map((classroom, i) =>
          <RenderClassroom key={i} classroom={classroom} />
        )}
      </ul>
    </> : (decks && decks.length === 0 && <div className='mt-3'>
      <h1>Welcome!</h1>
      <p>You don't have any decks and aren't enrolled in any classes.</p>
      <p>Would you like to...</p>
      <ButtonGroup>
        <Button className='mr-1' onClick={() => setJoinClassModalIsOpen(true)}>
          Join New Class
        </Button>
        <Button href='/home/decks/'>
          Create New Deck
        </Button>
      </ButtonGroup>
      <p className='mt-5'>
        If you're a teacher, you can change your account type <a href='/settings/'>here</a>.
      </p>
    </div>)) : <p>Loading...</p>}
    {decks !== undefined ? (decks.length > 0 && <>
      <hr />
      <h2 className='ml-3 mt-3'>
        {classrooms && classrooms.length > 0 ? 'Extracurricular Decks' : 'Decks'}
      </h2>
      <ul className='no-bullets'> {/* NOTE: the ul is for consistent indenting */}
        <table className='text-center'>
          <thead>
            <tr>
              <th>Title</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {decks.map((deck, i) => {
              const studyUrl = `/decks/${deck.id}/study/`;

              return (
                <tr onClick={() => {window.location.href = studyUrl}} key={i}>
                  <td>
                    <a href={studyUrl}>
                      {deck.title}
                    </a>
                  </td>
                  <td>
                    {deck.percent_complete !== undefined ? `${Math.floor(deck.percent_complete * 100 * 10)/10}%` : 'ERROR!'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ul>
    </>) : <p>Loading...</p>}
  </Container>)
}

interface RenderClassroomProps {
  classroom: ClassroomAssignments;
}
function RenderClassroom(props: RenderClassroomProps) {
  const { classroom } = props;
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);


  return (<>
    <li className='mb-5'>
      <h3>
        {classroom.title}{' '}
        {classroom.assignments.length > 0 && <>
          <button
            onClick={() => setEditModalIsOpen(true)}
            className='classroom-assignments-options'
          >
            <i className='fas fa-cog fa-sm' />
          </button>
        </>}
      </h3>
      {classroom.assignments.length > 0 ? <table className='text-center'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Due Date</th>
            <th>Progress</th>
          </tr>
        </thead>
        <tbody>
          {classroom.assignments.map((assignment, i) => {
            const studyUrl = `/classrooms/${classroom.id}/assignments/${assignment.id}/study/`;

            return (
              <tr onClick={() => {window.location.href = studyUrl}} key={i}>
                <td>
                  <a href={studyUrl} className='assignment-link'>
                    {assignment.title}
                  </a>
                </td>
                <td>
                  {new Date(assignment.due_date).toDateString()}
                </td>
                <td className='assignment-table__percent-complete'>
                  {/* TODO: make this a separate API call, so that the structure loads faster */}
                  {Math.floor((assignment.percent_complete ?? 0) * 100)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table> : <div>
        <p>No assignments!  Yay!</p>
        <small className='text-muted'>
          You can study ahead by going to your <a href='/home/decks/'>Deck Homepage</a> and clicking "Study" on the deck for this class.
        </small>
      </div>}
    </li>
    <Modal show={editModalIsOpen} onHide={() => setEditModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>
          Editing Flashcard Settings for {classroom.title}
        </Modal.Title>
      </Modal.Header>
      {/* <ClassroomSSMEditForm
        classroomId={classroom.id}
        closeModal={() => setEditModalIsOpen(false)}
      /> */}
    </Modal>
  </>);
}

function TeacherClassesComponent() {
  const [classrooms] = useApiObjectHook<Classroom[]>(apiClassroomsHomepage, 200, 8000);

  return (<Container className='ml-0'>
    <h1 className='ml-3 mt-3'>Classes You Teach</h1>
    <ButtonGroup className='ml-4'>
      <ClassroomEditCreateButton id='create-classroom-btn' />
    </ButtonGroup>
    <hr />
    {classrooms !== undefined ? (classrooms.length > 0 ? <>
      <ul className='no-bullets'>
        {classrooms.map((classroom, i) =>
          <li className='mb-5' key={i}>
            <h3>
              <a href={`/classrooms/${classroom.id}/`} className='text-dark'>
                {classroom.title}
              </a>
            </h3>
            <ClassroomDefaultButtonGroup classroom={classroom} />
          </li>
        )}
      </ul>
    </> : <p>You don't have any classes yet.  Click the button above to create one.</p>) : <p>Loading...</p>}
  </Container>);
}


interface QuickFeedback {
  prompt: string;
  description: string;
  answer_type: 'YES/NO' | 'SCALE_1_TO_7' | 'CHECKBOX_CHOICE' | 'RADIO_CHOICE';
  answer_choices?: string;
  requirements: 'NONE' | 'STUDIED_TODAY' | 'STUDY_PAST_WEEK' | 'STUDY_TWICE_PAST_WEEK' | 'STUDY_TEN_TIMES_PAST_MONTH' | 'IS_TEACHER' | 'IS_STUDENT';
  message?: string;
  id: number;
}
function FeedbackComponent() {
  const attemptQuestion = useMemo(() => Math.random() < 0.5, []);
  const [finishedAnswering, setFinishedAnswering] = useState(false);
  const [quickFeedback] = useApiObjectHook<QuickFeedback>(
    apiFeedbackGetQuestion,
    200,
    4002,
    undefined, undefined, undefined,
    attemptQuestion,
  );

  if (!attemptQuestion || !quickFeedback || quickFeedback.message === 'No question available')
    return null;

  const answers = () => {
    const respondToQuestion = (questionResponse: string) => {
      return () => {
        apiFeedbackRespondQuestion(quickFeedback.id, questionResponse, (response, status) => {
          if (status === 200) {
            setFinishedAnswering(true);
          } else {
            // Error responding to quick feedback question
            errorHandler(response, status, 4003);
          }
        });
      }
    }

    // Submits either a radio or checkbox answer
    const submitMultipleChoice = event => {
      event.preventDefault();

      let selectedOptions: string[] = [];
      const choices = document.getElementsByName('choice') as NodeListOf<HTMLInputElement>;
      for (const choice of choices) {
        if (choice.checked) selectedOptions.push(choice.value);
      }

      respondToQuestion(selectedOptions.join('; '))();
    }

    const MultipleChoice = (type: 'radio' | 'checkbox') => {
      return (
        <form onSubmit={submitMultipleChoice}>
          {quickFeedback.answer_choices?.split('; ').map((choice, i) => <React.Fragment key={i}>
            <label className='feedback-radio-option'>
              {choice === 'Other' ? <>
                <input
                  type={type}
                  name='choice'
                  value={choice}
                  id='otherChoice'
                /> Other{' '}
                <input
                  type='text'
                  name='otherTextInput'
                  id='otherTextInput'
                  maxLength={128}
                  onClick={() => {
                    const otherChoice = document.getElementById('otherChoice') as HTMLInputElement;
                    otherChoice.checked = true;
                  }}
                  onBlur={() => {
                    const otherChoice = document.getElementById('otherChoice') as HTMLInputElement;
                    const otherTextInput = document.getElementById('otherTextInput') as HTMLInputElement;
                    otherChoice.value = otherTextInput.value || 'Other';
                  }}
                />
              </> : <>
                <input
                  type={type}
                  name='choice'
                  value={choice}
                /> {choice}
              </>}
            </label>
            <br />
          </React.Fragment>)}
          <Button type='submit'>Submit</Button>
        </form>
      );
    }


    switch (quickFeedback.answer_type) {
      case 'YES/NO':
        return (<>
          <Button onClick={respondToQuestion('Yes')}>
            Yes
          </Button>
          <Button onClick={respondToQuestion('No')} className='ml-3'>
            No
          </Button>
        </>);
      case 'SCALE_1_TO_7':
        return (
          <Likert
            question=''
            responses={[
              { value: 1, text: '1' },
              { value: 2, text: '2' },
              { value: 3, text: '3' },
              { value: 4, text: '4' },
              { value: 5, text: '5' },
              { value: 6, text: '6' },
              { value: 7, text: '7' },
            ]}
            onChange={val => respondToQuestion(val.text)()}
          />
        );
      case 'RADIO_CHOICE':
        return MultipleChoice('radio');
      case 'CHECKBOX_CHOICE':
        return MultipleChoice('checkbox');
    }
  }

  return (
    <Alert variant='info' className='mt-3 container ml-3'>
      {finishedAnswering ? <>
        <p className='mb-0'>
          Thank you for taking the time to provide feedback on Alu!
        </p>
      </> : <>
        <p>Help Improve Alu</p>
        <hr />
        <h4>{quickFeedback.prompt}</h4>
        <p>{quickFeedback.description}</p>
        {answers()}
      </>}
    </Alert>
  );
}
