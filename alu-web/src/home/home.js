import React, {useState, useEffect} from 'react';
import {Card, CardDeck, Button} from 'react-bootstrap';
import {apiProfileDetail, apiProfileFriends} from '../lookup';
import {errorHandler, DisplayCountCommas} from '../utils';
import {UserLink} from '../profiles/components';
import {randomTip} from './randomtips';
import './home.css';

export function HomeComponent(props) {
  const {username} = props;
  
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
    <div className='text-center mt-5'>
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
      <div
        className='text-center w-25 mx-auto alert alert-info'
      >
        {randomTip}
      </div>
      <div className='mt-5'>
        <h3>Stats</h3>
        <h4>{profile.first_name} {profile.last_name}</h4>
        <h5 className='text-secondary'>@{profile.username}</h5>
        <p>Total thanks recieved:{' '}
          <DisplayCountCommas>{profile.total_thanks_recieved}</DisplayCountCommas>
        </p>
        {/* TODO: review heatmap */}
      </div>
      <div className='row'>
        <div className='col-12'>
          <h3>Friends</h3>
          {friendsDidSet ? <>
            {friends.length > 0 ?
              friends.map((friend, index) => {
                if (friend) {
                  return (
                    <div key={`friend-${index}`}>
                      <hr />
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