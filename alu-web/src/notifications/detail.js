import React, {useState} from 'react';
import {Button} from 'react-bootstrap';
import {timeSince} from './utils';
import {apiProfileFriendToggle, apiProfileDetail} from '../lookup';
import ReactMarkdown from 'react-markdown';

export function Notification(props) {
  const {notif, read} = props;
  const [friendBtnLabel, setFriendBtnLabel] = useState('Add Friend');
  const [acceptedFriendReq, setAcceptedFriendReq] = useState(false);

  if (notif.category === 'friend_request') {
    // Get anything in the description starting with @
    const match = notif.description.match(/(@[a-z]+)/gm)[0];
    const senderUsername = match.substring(1, match.length);

    // Check if you are already friends
    apiProfileDetail(senderUsername, (response, status) => {
      if (status === 200) {
        if (response.is_friend) {
          setFriendBtnLabel('Friends');
          setAcceptedFriendReq(true);
        };
      } else {
        console.log(response, status);
        alert('Error accepting friend!'); // TODO: turn this else statement into reusuable function
      };
    });
  };

  const handleFriendAccepted = (event) => {
    event.preventDefault();
    if (acceptedFriendReq === false) {
      setAcceptedFriendReq(true);
      // Get anything in the description starting with @
      const match = notif.description.match(/(@[a-z]+)/gm)[0];
      const senderUsername = match.substring(1, match.length);
  
      // Accept friend request
      apiProfileFriendToggle(senderUsername, 'friend', (response, status) => {
        if (status === 200) {
          setFriendBtnLabel('Friends')
        } else {
          console.log(response, status);
          alert('Error accepting friend!');
        };
      });
    };
  };

  return (
    <div className='mb-3'>
      <small className='mb-0 text-secondary'>{timeSince(new Date(notif.timestamp)) + ' ago'}</small>
      <h4 className='mb-0'>
        <span style={{color: 'green'}}>{read ? '' : '• '}</span>
        {notif.title}
      </h4>
      <ReactMarkdown source={notif.description} />
      {notif.category === 'friend_request' ? <Button onClick={handleFriendAccepted} size='sm' className='mt-2'>{friendBtnLabel}</Button> : ''}
    </div>
  );
};