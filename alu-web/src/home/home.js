import React, {useState, useEffect} from 'react';
import {Card, CardDeck, Button} from 'react-bootstrap';
import {apiProfileDetail, apiProfileFriends} from '../lookup';
import {errorHandler, DisplayCountCommas, shiftDate, range} from '../utils';
import {UserLink} from '../profiles/components';
import {randomTip} from './randomtips';
import CalendarHeatmap from 'react-calendar-heatmap';
import ReactTooltip from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import './home.css';

export function HomeComponent(props) {
  const {username} = props;
  const today = new Date();

  const randomValues = range(0, 366).map(i => {
    return {
      date: shiftDate(today, -i),
      count: Math.floor(Math.random()*8),
    };
  });
  
  const [profile, setProfile] = useState({});
  const [profileDidSet, setProfileDidSet] = useState(false);
  const [friends, setFriends] = useState({});
  const [friendsDidSet, setFriendsDidSet] = useState(false);

  useEffect(() => {
    if (profileDidSet === false) {
      setProfileDidSet(true);
      apiProfileDetail(username, (response, status) => {
        if (status === 200) {
          setProfile(response);
        } else {
          // Error getting profile detail for home page
          errorHandler(response, status, 3010);
        };
      });
    };
  }, [username, setProfile, profileDidSet, setProfileDidSet]);

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
    };
  }, [username, setFriends, friendsDidSet, setFriendsDidSet]);

  return (
    <div className='text-center mt-5 w-100' style={{overflow: 'hidden'}}>
      <h1>Home</h1>
      <CardDeck className='w-75 mx-auto'>
        <a href='/home/decks/' className='card'>
          <i className='fas fa-window-restore fa-10x card-img-top mx-auto text-center my-3'></i>
          <Card.Title>
            Decks
          </Card.Title>
        </a>
        <a href='/home/notes/' className='card'>
          <i className='fas fa-edit fa-10x card-img-top mx-auto text-center my-3'></i>
          <Card.Title>
            Notes
          </Card.Title>
        </a>
      </CardDeck>
      <hr />
      <div className='mt-1'>
        <h3>Stats</h3>
        <h4>{profile.first_name} {profile.last_name}</h4>
        <h5 className='text-secondary'>@{profile.username}</h5>
        <p>Total thanks recieved:{' '}
          <DisplayCountCommas>{profile.total_thanks_recieved}</DisplayCountCommas>
        </p>
        <div className='w-50 mx-auto mb-3'>
          <CalendarHeatmap
            startDate={shiftDate(today, -366)}
            endDate={today}
            values={randomValues}
            tooltipDataAttrs={value => {
              return {
                'data-tip': `${value.date.toISOString().slice(0, 10)} has count: ${
                  value.count
                }`,
              };
            }}
            classForValue={(value) => {
              return `color-scale-${Math.min(value.count, 7)}`;
            }}
          />
          <ReactTooltip />
          Longest streak: {10} | Current streak: {10}
        </div>
        <div
          className='text-center w-25 mx-auto alert alert-info'
        >
          {randomTip}
        </div>
      </div>
      <div className='row'>
        <div className='col-12'>
          <hr />
          <h3>Friends</h3>
          {friendsDidSet ? <>
            {friends.length > 0 ?
              friends.map((friend, index) => {
                if (friend) {
                  return (
                    <div key={`friend-${index}`}>
                      <UserLink user={friend} hideBadges />
                      <Button href={`/profiles/u/${friend.username}`} className='mt-2'>
                        View Profile
                      </Button>
                    </div>
                  );
                } else {
                  return null;
                };
              })
            :
            <p>
              You don't have any friends yet.<br /> Look for some to make your learning
              experience even better!
            </p>
            }</>
            :
            <p>Loading...</p>
          }
        </div>
      </div>
    </div>
  );
}