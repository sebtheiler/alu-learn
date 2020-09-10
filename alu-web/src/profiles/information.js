import React, {useState, useEffect} from 'react';
import {apiProfileDetail, apiProfileFriendToggle, apiSendFriendReq} from '../lookup';
import {UserLink} from './components';
import {DisplayCountChar, errorHandler} from '../utils';
import {Button} from 'react-bootstrap';


// Function for displaying user information such as bio, friendcount, location, etc.
// as well as an 'Add/Remove Friend' button
function ProfileInformation(props) {
  const {user, didFriendToggle, profileLoading, viewingOwnProfile} = props;

  if (viewingOwnProfile === false) {
    // Updates the front-end display and calls the callback `didFriendToggle`

    var currentVerb;
    if (user && user.is_friend) {
      currentVerb = 'Remove Friend';
    } else if (user.you_are_pending) {
      currentVerb = 'Requested';
    } else {
      currentVerb = 'Add Friend';
    };
    currentVerb = profileLoading ? 'Loading...' : currentVerb;

    var handleFriendToggle = (event) => {
      event.preventDefault();
      if (currentVerb !== 'Requested' && currentVerb !== 'Loading...' && !profileLoading) {
        const action = currentVerb === 'Remove Friend' ? 'unfriend' : 'friend';
        didFriendToggle(action);
      };
    };
  };

  return user ? (
    <>
      <UserLink user={user} noLink showAllBadges/>
      <small className='mt-0 text-secondary'>
        <DisplayCountChar>{user.total_thanks_recieved}</DisplayCountChar> thank{user.total_thanks_recieved === 1 ? '' : 's'} recieved
      </small>
      <div className={'mt-3' + (user.location ? '' : ' d-none')}>
        <h5 className='mb-0'>Location</h5>
        <p>{user.location}</p>
      </div>
      <h5 className='mb-0'>Bio</h5>
      <p>{user.bio ? user.bio : "This user hasn't set a bio yet..."}</p>
      {viewingOwnProfile === false ?
        <Button onClick={handleFriendToggle} variant='primary'>{currentVerb}</Button>
        :
        <Button href='/profiles/edit/' variant='primary'>Edit Profile</Button>
      }
    </>
  ) : null;
};


// Component for profile information
export function ProfileInformationComponent(props) {
  const {username, currentUserUsername} = props;
  const [didLookup, setDidLookup] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Set the profile for the first time
  useEffect(() => {
    if (didLookup === false) {
      apiProfileDetail(username, (response, status) => {
        if (status === 200) {
          setProfile(response);
        } else {
          // Error getting profile details
          errorHandler(response, status, 3000);
        };
      });
      setDidLookup(true);
    };
  }, [username, didLookup, setDidLookup]);

  // When the 'Add/Remove Friend' button is pressed, send a message to the API
  // and make the button say 'Loading...' as it waits
  const handleNewFriend = (actionVerb) => {
    setProfileLoading(true);
    if (actionVerb === 'unfriend') {
      // Unfriend the user instantly
      apiProfileFriendToggle(username, 'unfriend', (response, status) => {
        if (status === 200) {
          setProfile(response);
        };
        setProfileLoading(false);
      });
    } else {
      // Send a friend request
      apiSendFriendReq(username, (response, status) => {
        setProfileLoading(true);
        if (status === 201) {
          profile.you_are_pending = true;
        } else {
          // Error sending friend request
          errorHandler(response, status, 3001);
        };
        setProfileLoading(false);
      });
    };
  };

  // If the user is viewing their own profile, don't show the 'Add Friend' button and show a button for editing
  const viewingOwnProfile = username === currentUserUsername;

  return didLookup === false ? 'Loading...' :
    (profile ?
      <ProfileInformation
        user={profile}
        viewingOwnProfile={viewingOwnProfile}
        didFriendToggle={handleNewFriend}
        profileLoading={profileLoading}
      />
    : null);
};