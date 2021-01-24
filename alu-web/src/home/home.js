import React, { useState, useEffect } from 'react';
import { Card, CardDeck, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { apiClassroomStudentJoin, apiProfileDetail, apiProfileFriends, apiProfileHistory, apiClassroomsStudentJoined } from '../lookup';
import { errorHandler, shiftDate, range, timezoneToISOString, useApiObjectHook } from '../utils';
import { UserLink } from '../profiles/components';
import { randomTip } from './randomtips';
import CalendarHeatmap from 'react-calendar-heatmap';
import ReactTooltip from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import './home.css';

export function HomeComponent({ username }) {
  const [profile, setProfile] = useState(null);
  const [profileDidSet, setProfileDidSet] = useState(false);

  // Get profile detail
  useEffect(() => {
    if (profileDidSet === false) {
      setProfileDidSet(true);
      apiProfileDetail(username, (response, status) => {
        if (status === 200) {
          setProfile(response);
        } else {
          // Error getting profile detail for home page
          errorHandler(response, status, 3010);
        }
      });
    }
  }, [username, setProfile, profileDidSet, setProfileDidSet]);

  return (
    <div className='text-center mt-5 w-100' style={{ overflow: 'hidden' }}>
      <h1>Home</h1>
       <CardDeck className='mx-5'>
        {profile?.settings?.user_type === 'TEACHER' && <a href='/home/classrooms/' className='card'>
          <i className='fas fa-chalkboard-teacher fa-10x card-img-top mx-auto text-center my-3'></i>
          <Card.Title>
            Classes Taught
          </Card.Title>
        </a>}
        <a href='/home/decks/' className='card'>
          <i className='fas fa-window-restore fa-10x card-img-top mx-auto text-center my-3'></i>
          <Card.Title>
            Flashcard Decks
          </Card.Title>
        </a>
        <a href='/home/notes/' className='card'>
          <i className='fas fa-edit fa-10x card-img-top mx-auto text-center my-3'></i>
          <Card.Title>
            Notes
          </Card.Title>
        </a>
        <a href='/home/manual-sr/' className='card'>
          <i className='fas fa-clock fa-10x card-img-top mx-auto text-center my-3'></i>
          <Card.Title>
            Tasks
          </Card.Title>
        </a>
      </CardDeck>
      <hr />
      <StatsComponent profile={profile} />
      <hr />
      <Row>
        <Col style={{ minHeight: '500px' }}>
          <FriendsComponent username={username} />
        </Col>
        {profile?.settings?.user_type === 'STUDENT' && <Col>
          <ClassroomsComponent username={username} />
        </Col>}
      </Row>
    </div>
  );
}


function ClassroomsComponent({ username }) {
  const [classrooms] = useApiObjectHook(apiClassroomsStudentJoined, 200, 8005);
  const [joinClassModalIsOpen, setJoinClassModalIsOpen] = useState(false);

  const handleJoinClass = event => {
    event.preventDefault();
    const form = event.target;

    apiClassroomStudentJoin(form.elements.classCode.value, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        // Error joining class
        errorHandler(response, status, 8004);
      }
    });
  }

  return (<>
    <h3>Classes</h3>
    <Button className='mx-auto mb-5' onClick={() => setJoinClassModalIsOpen(true)}>Join Class</Button>
    <Modal show={joinClassModalIsOpen} onHide={() => setJoinClassModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>Join Class</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleJoinClass}>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor='classCode'>
              <p className='mb-0'>Class Code</p>
              <small className='text-muted'>Your teacher will provide you with a class code.  Please enter it here.</small>
            </Form.Label>
            <Form.Control
              type='text'
              name='classCode'
              maxLength='8' minLength='8'
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setJoinClassModalIsOpen(false)} variant='secondary'>Cancel</Button>
          <Button type='submit' variant='primary'>Join!</Button>
        </Modal.Footer>
      </Form>
    </Modal>
    {classrooms && classrooms.map((classroom, i) => (<div key={i}>
      <hr />
      <p>{classroom.title}</p>
      <Button href={`/classrooms/${classroom.id}/student/`}>View Class</Button>
    </div>))}
  </>);
}


function FriendsComponent({ username }) {
  const [friends, setFriends] = useState(null);
  const [friendsDidSet, setFriendsDidSet] = useState(false);

  useEffect(() => {
    if (friendsDidSet === false) {
      setFriendsDidSet(true);
      apiProfileFriends(username, (response, status) => {
        if (status === 200) {
          setFriends(response);
        } else {
          // Error getting list of friends
          errorHandler(response, status, 3011);
        }
      });
    }
  }, [username, setFriends, friendsDidSet, setFriendsDidSet]);


  return (<>
    <h3>Friends</h3>
    {friends ? <>
      {friends.length > 0 ?
        friends.map((friend, index) => {
          if (friend) {
            return (
              <div key={`friend-${index}`} className='mb-4'>
                <UserLink user={friend} hideBadges />
                <Button href={`/profiles/u/${friend.username}`} className='mt-2'>
                  View Profile
                </Button>
              </div>
            );
          } else {
            return null;
          }
        })
      :
      <p>You don't have any friends yet</p>
      }</>
      :
      <p>Loading...</p>
    }
  </>);
}


const today = new Date();
const blankValues = range(0, 366).map(i => {
  return {
    date: shiftDate(today, -i),
    cardsDone: 0,
    timeSpent: 0,
  };
});


function StatsComponent({ profile }) {
  const [userHistory, setUserHistory] = useState(blankValues);
  const [gotHistory, setGotHistory] = useState(false);
  const [maxReviews, setMaxReviews] = useState([0, 100]);

  // Used for dynamically changing object positioning
  const determineItemWidthClass = (clientWidth) => {
    if (clientWidth < 500) {return 'w-100'} else
    if (clientWidth < 900) {return 'w-75'} else
    {return 'w-50'}
  }
  const [heatmapWidthClass, setHeatmapWidthClass] = useState(determineItemWidthClass(document.documentElement.clientWidth));
  window.addEventListener("resize", (_event) => {
    setHeatmapWidthClass(determineItemWidthClass(document.documentElement.clientWidth));
  });


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

  return (<>
    <div className='mt-1'>
      <h3>Stats</h3>
      <h4>{profile?.first_name} {profile?.last_name}</h4>
      <h5 className='text-secondary'>@{profile?.username}</h5>
      <div className={`${heatmapWidthClass} mx-auto mb-3`}>
        <CalendarHeatmap
          startDate={shiftDate(today, -366)}
          endDate={today}
          values={userHistory}
          tooltipDataAttrs={value => {
            return {
              'data-tip': value && value.date ? `You reviewed ${value.cardsDone} flashcards on ${
                timezoneToISOString(value.date).slice(0, 10)}${!!value.timeSpent ? ` in ${Math.round(value.timeSpent/1000/60)} minutes` : ''}
              ` : 'Error, please report this',
            };
          }}
          classForValue={(value) => {
            var colorValue;
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
        Reviews today: {userHistory.sort(hist => hist.date)[0].cardsDone} |{' '}
        Time studying today: {Math.round(userHistory.sort(hist => hist.date)[0].timeSpent/1000/60)}m |{' '}
        Longest streak: {profile?.longest_streak} |{' '}
        Current streak: {profile?.current_streak}
      </div>
      <div
        className={`text-center mx-auto alert alert-info ${heatmapWidthClass}`}
      >
        {randomTip}
      </div>
    </div>
  </>);
}