import React, {useState, useEffect} from 'react';
import {apiProfileDetail, apiProfileFriendToggle} from '../lookup/lookup';
import {UserLink, UserPicture} from './components';
import {DisplayCount} from './utils';

function ProfileBadge(props) {
    const {user, didFriendToggle, profileLoading} = props;
    
    let currentVerb = (user && user.is_following) ? "Remove Friend" : "Add Friend";
    currentVerb = profileLoading ? 'Loading...' : currentVerb;
    const handleFriendToggle = (event) => {
        event.preventDefault();
        if (didFriendToggle && !profileLoading) {
            didFriendToggle(currentVerb);
        };
    };

    return user ? (<div>
        <UserPicture user={user} />
        <p><UserLink user={user} includeFullName noLink /></p>
        <p>{user.follower_count === 1 ? "Friend" : "Friends"}: <DisplayCount>{user.follower_count}</DisplayCount></p>
        <p>{user.location}</p>
        <p>{user.bio}</p>
        <button onClick={handleFriendToggle} className='btn btn-primary'>{currentVerb}</button>
    </div>) : null;
};

export function ProfileBadgeComponent(props) {
    const {username} = props;
    const [didLookup, setDidLookup] = useState(false);
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    const handleBackendLookup = (response, status) => {
        if (status === 200) {
            setProfile(response);
        } else {
            alert('Deck not found!');
        };
    };

    useEffect(() => {
        if (didLookup === false) {
            apiProfileDetail(username, handleBackendLookup);
            setDidLookup(true);
        };
    }, [username, didLookup, setDidLookup]);

    const handleNewFriend = (actionVerb) => {
        setProfileLoading(true);
        apiProfileFriendToggle(username, actionVerb, (response, status) => {
            if (status === 200) {
                setProfile(response);
            };
            setProfileLoading(false);
        });
    };

    return didLookup === false ? 'Loading...' : (profile ? <ProfileBadge user={profile} didFriendToggle={handleNewFriend} profileLoading={profileLoading} /> : null);
};