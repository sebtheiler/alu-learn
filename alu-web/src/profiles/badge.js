import React, {useState, useEffect} from 'react';
import {apiProfileDetail, apiProfileFriendToggle, apiSendFriendReq} from '../lookup';
import {UserLink, UserPicture} from './components';
import {DisplayCount} from './utils';


// Function for displaying user information such as bio, friendcount, location, etc.
// as well as an 'Add/Remove Friend' button
function ProfileBadge(props) {
  const {user, didFriendToggle, profileLoading, showFriendButton} = props;

  if (showFriendButton) {
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
        const action = currentVerb === "Remove Friend" ? "unfriend" : "friend";
        didFriendToggle(action);
      };
    };
  };

  return user ? (
    <div>
      <UserPicture user={user} />
      <p><UserLink user={user} includeFullName noLink /></p>
      <p><DisplayCount>{user.friend_count}</DisplayCount> {user.friend_count === 1 ? "friend" : "friends"}</p>
      <p>{user.location}</p>
      <p>{user.bio}</p>
      {showFriendButton === true ? <button onClick={handleFriendToggle} className='btn btn-primary'>{currentVerb}</button> : null}
    </div>
  ) : null;
};


// Component for profile badge
// This will need to be updated when friending requires consent from both parties
export function ProfileBadgeComponent(props) {
  const {username, currentUserUsername} = props;
  const [didLookup, setDidLookup] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Update the profile on the front-end
  const handleBackendLookup = (response, status) => {
    if (status === 200) {
      setProfile(response);
    } else {
      alert('Error handling the profile!');
    };
  };

  // Set the profile for the first time
  useEffect(() => {
    if (didLookup === false) {
      apiProfileDetail(username, handleBackendLookup);
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
          console.log(response, status);
          alert('Error sending friend request');
        };
        setProfileLoading(false);
      });
    };
  };

  // If the user is viewing their own profile, don't show the 'Add Friend' button
  let showFriendButton = true;
  if (username === currentUserUsername) {
    showFriendButton = false;
  };

  return didLookup === false ? 'Loading...' :
    (profile ?
      <ProfileBadge user={profile} showFriendButton={showFriendButton} didFriendToggle={handleNewFriend} profileLoading={profileLoading} />
    : null);
};