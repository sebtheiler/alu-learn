import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { apiClassroomStudentJoin, apiProfileDetail, apiProfileFriends, apiProfileHistory, apiClassroomsStudentJoined, apiClassroomsHomepage, apiStudentAssignmentsList, apiQuickDeckList } from '../lookup';
import { errorHandler, shiftDate, range, timezoneToISOString, useApiObjectHook } from '../utils';
import { randomTip } from './randomtips';
import CalendarHeatmap from 'react-calendar-heatmap';
import ReactTooltip from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import './home.css';
import { MinifiedProfile, Profile, ProfileHistory } from '../profiles/types';
import { Classroom, ClassroomAssignments } from '../teachers/types';
import { ClassroomDefaultButtonGroup, ClassroomEditCreateButton } from '../teachers/buttons';

export function HomeComponent({ username }) {
  const [profile] = useApiObjectHook<Profile>(apiProfileDetail, 200, 3010, [username]);
  const [joinClassModalIsOpen, setJoinClassModalIsOpen] = useState(false);

  return (<Container fluid>
    <Row>
      <Col xs={2} id='home-nav-sidebar' className='mt-3'>
        <ul className='no-bullets'>
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
          <li>
            <h4>
              <a href='/home/notes/' id='notes-link'>
                <i className='fas fa-edit'></i>{' '}
                Notes
              </a>
            </h4>
          </li>
          <li>
            <h4>
              <a href='/home/manual-sr/' id='tasks-link'>
                <i className='fas fa-clock'></i>{' '}
                Tasks
              </a>
            </h4>
          </li>
          <hr />
          <li>
            <FriendsComponent />
          </li>
        </ul>
      </Col>
      <Col xs={10} id='home-main'>
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
  const [friends] = useApiObjectHook<MinifiedProfile[]>(apiProfileFriends, 200, 3011);

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
          <a href={`/profiles/u/${friend.id}/`} className='friend-link'>
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
  } as ProfileHistory;
});

function StatsComponent({ profile }) {
  const [userHistory, setUserHistory] = useState<ProfileHistory[]>(blankValues);
  const [gotHistory, setGotHistory] = useState(false);
  const [maxReviews, setMaxReviews] = useState(0);

  // Get profile history
  useEffect(() => {
    if (gotHistory === false && profile) {
      setGotHistory(true);
      apiProfileHistory(profile.username, (response, status) => {
        if (status === 200) {
          setMaxReviews(Math.max(...response.map(hist => hist.cards_done)));
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
              }
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
            return {
              'data-tip': value && value.date ? `You reviewed ${value.cardsDone} flashcards on ${
                timezoneToISOString(value.date).slice(0, 10)}${!!value.timeSpent ? ` in ${Math.round(value.timeSpent/1000/60)} minutes` : ''}
              ` : 'Error, please report this',
            };
          }}
          classForValue={(value) => {
            let colorValue: number;
            if (!value) {
              colorValue = 0;
            } else {
              const unit = maxReviews / 7; // 7 = number of colors that aren't zero
              const cardsDone = value.cardsDone;
              if (cardsDone === 0) {colorValue = 0} else
              if (cardsDone > maxReviews - unit*1) {colorValue = 7} else
              if (cardsDone > maxReviews - unit*2) {colorValue = 6} else
              if (cardsDone > maxReviews - unit*3) {colorValue = 5} else
              if (cardsDone > maxReviews - unit*4) {colorValue = 4} else
              if (cardsDone > maxReviews - unit*5) {colorValue = 3} else
              if (cardsDone > maxReviews - unit*6) {colorValue = 2} else
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
    apiQuickDeckList,
    200,
    1029,
  );

  return (<Container className='ml-0'>
    {classrooms !== undefined ? (classrooms.length > 0 ? <>
      <h1 className='ml-3 mt-3'>Assignments</h1>
      <hr />
      <ul className='no-bullets'>
        {classrooms.map((classroom, i) =>
          <li className='mb-5' key={i}>
            <h3>{classroom.title}</h3>
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
