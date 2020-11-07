import React, {useState, useEffect} from 'react';
import {Card, CardDeck, Button} from 'react-bootstrap';
import {apiProfileDetail, apiProfileFriends, apiProfileHistory} from '../lookup';
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

  const blankValues = range(0, 366).map(i => {
    return {
      date: shiftDate(today, -i),
      cardsDone: 0,
    };
  });

  // Used for dynamically changing object positioning
  const determineItemWidthClass = (clientWidth) => {
    if (clientWidth < 500) {return 'w-100'} else
    if (clientWidth < 900) {return 'w-75'} else
    {return 'w-50'}
  };
  const [heatmapWidthClass, setHeatmapWidthClass] = useState(determineItemWidthClass(document.documentElement.clientWidth));
  window.addEventListener("resize", (_event) => {
    setHeatmapWidthClass(determineItemWidthClass(document.documentElement.clientWidth));
  });
  
  const [profile, setProfile] = useState({});
  const [profileDidSet, setProfileDidSet] = useState(false);
  const [friends, setFriends] = useState({});
  const [friendsDidSet, setFriendsDidSet] = useState(false);
  const [userHistory, setUserHistory] = useState(blankValues);
  const [gotHistory, setGotHistory] = useState(false);
  const [maxReviews, setMaxReviews] = useState([0, 100]);

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

  useEffect(() => {
    if (gotHistory === false) {
      setGotHistory(true);
      apiProfileHistory(username, (response, status) => {
        if (status === 200) {
          setMaxReviews(Math.max(...response.map(hist => hist.cards_done)));
          const gottenDates = response.map(hist => hist.date);
          const historyValues = userHistory.map(hist => {
            // Check if we have that date in history
            if (gottenDates.includes(hist.date.toISOString().slice(0, 10))) {
              // Get the date that matches
              const date = response.filter(subHist => subHist.date === hist.date.toISOString().slice(0, 10))[0];
              return {
                ...hist,
                cardsDone: date.cards_done,
              };
            } else {
              // Return the standard/blank value
              return hist;
            };
          });
          setUserHistory(historyValues);
        } else {
          // Error getting user history
          errorHandler(response, status, 3013);
        };
      });
    };
  }, [username, gotHistory, setGotHistory, userHistory, setUserHistory]);

  return (
    <div className='text-center mt-5 w-100' style={{overflow: 'hidden'}}>
      <h1>Home</h1>
      <CardDeck className='w-75 mx-auto'>
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
      <div className='mt-1'>
        <h3>Stats</h3>
        <h4>{profile.first_name} {profile.last_name}</h4>
        <h5 className='text-secondary'>@{profile.username}</h5>
        <p>Total thanks recieved:{' '}
          <DisplayCountCommas>{profile.total_thanks_recieved}</DisplayCountCommas>
        </p>
        <div className={`${heatmapWidthClass} mx-auto mb-3`}>
          <CalendarHeatmap
            startDate={shiftDate(today, -366)}
            endDate={today}
            values={userHistory}
            tooltipDataAttrs={value => {
              return {
                'data-tip': value && value.date ? `You reviewed ${value.cardsDone} flashcards on ${
                  value.date.toISOString().slice(0, 10)
                }` : 'Error, please report this',
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
              };
              return `color-scale-${Math.min(colorValue, 7)}`;
            }}
          />
          <ReactTooltip />
          Reviews today: {userHistory.sort(hist => hist.date)[0].cardsDone} | Longest streak: {profile.longest_streak} | Current streak: {profile.current_streak}
        </div>
        <div
          className={`text-center mx-auto alert alert-info ${heatmapWidthClass}`}
        >
          {randomTip}
        </div>
      </div>
      <div className='row'>
        <div className='col-12' style={{minHeight: '500px'}}>
          <hr />
          <h3>Friends</h3>
          {friendsDidSet ? <>
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
                };
              })
            :
            <p>You don't have any friends yet</p>
            }</>
            :
            <p>Loading...</p>
          }
        </div>
      </div>
    </div>
  );
};