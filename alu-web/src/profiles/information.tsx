import React, { useState, useEffect, useMemo } from 'react';
import { apiProfileDetail, apiProfileFriendToggle, apiSendFriendReq } from '../lookup';
import { UserLink } from './components';
import { errorHandler } from '../utils';
import Button from 'react-bootstrap/Button';
import { Profile } from './types';


// Function for displaying user information such as bio, friendcount, location, etc.
// as well as an 'Add/Remove Friend' button
interface ProfileInfoProps {
  user: Profile;
  didFriendToggle(action: string): void;
  profileLoading?: boolean;
  viewingOwnProfile?: boolean;
}
function ProfileInformation(props: ProfileInfoProps) {
  const { user, didFriendToggle, profileLoading, viewingOwnProfile } = props;
  let currentVerb = (() => {
    if (viewingOwnProfile) return '';
    if (!user) return 'Loading...';

    if (user && user.is_friend) {
      return 'Remove Friend';
    } else if (user.you_are_pending) {
      return 'Requested';
    } else {
      return 'Add Friend';
    }
  })();

  const handleFriendToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    if (currentVerb !== 'Requested' && currentVerb !== 'Loading...' && !profileLoading) {
      const action = currentVerb === 'Remove Friend' ? 'unfriend' : 'friend';
      didFriendToggle(action);

      switch (currentVerb) {
        case 'Remove Friend':
          currentVerb = 'Add Friend';
          break;
        case 'Add Friend':
          currentVerb = 'Requested';
          break;
      }
    }
  }

  return (
    user && <>
      <UserLink user={user} noLink showAllBadges />
      <h5 className='mb-0'>Bio</h5>
      <p>{user.bio ? user.bio : "This user hasn't set a bio yet..."}</p>
      {!viewingOwnProfile ?
        <Button
          onClick={handleFriendToggle}
          className='friend-btn'
        >
          {currentVerb}
        </Button>
        :
        <Button
          href='/profiles/edit/'
          className='edit-profile-btn'
        >
          Edit Profile
        </Button>
      }
    </>
  );
}


// Component for profile information
export function ProfileInformationComponent({ username, currentUserUsername }) {
  const [didLookup, setDidLookup] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (didLookup === false) {
      apiProfileDetail(username, (response, status) => {
        if (status === 200) {
          setProfile(response);
        } else {
          // Error getting profile details
          errorHandler(response, status, 3000);
        }
      });
      setDidLookup(true);
    }
  }, [username, didLookup, setDidLookup]);

  const handleNewFriend = (actionVerb: 'friend' | 'unfriend') => {
    if (!profile) return;
    setProfileLoading(true);

    if (actionVerb === 'unfriend') {
      apiProfileFriendToggle(username, 'unfriend', (response, status) => {
        if (status === 200) {
          setProfile(response);
        }
        setProfileLoading(false);
      });
    } else {
      apiSendFriendReq(username, (response, status) => {
        if (status === 201) {
          profile.you_are_pending = true;
        } else {
          // Error sending friend request
          errorHandler(response, status, 3001);
        }
        setProfileLoading(false);
      });
    }
  }

  if (!didLookup || !profile) return 'Loading...';
  return (
    <ProfileInformation
      user={profile}
      viewingOwnProfile={username === currentUserUsername}
      didFriendToggle={handleNewFriend}
      profileLoading={profileLoading}
    />
  );
}
