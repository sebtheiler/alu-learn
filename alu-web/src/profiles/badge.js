import React, {useState, useEffect} from 'react';
import {apiProfileDetail} from '../lookup/lookup';

export function ProfileBadgeComponent(props) {
    const {username} = props;
    const [didLookup, setDidLookup] = useState(false);
    const [profile, setProfile] = useState(null);

    const handleBackendLookup = (response, status) => {
        if (status === 200) {
            console.log(response, status)
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

    return didLookup === false ? 'Loading...' : (profile ? (<span>{profile.first_name}</span>) : null);
};