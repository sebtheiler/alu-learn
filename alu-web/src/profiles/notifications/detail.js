import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { timeSince, errorHandler } from '../../utils';
import { apiProfileFriendToggle, apiProfileDetail } from '../../lookup';
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
    // This needs to be optimized
    // marking as read also needs to be optimized
    // since it is always sent, even if nothiing
    // is now read
    apiProfileDetail(senderUsername, (response, status) => {
      if (status === 200) {
        if (response.is_friend) {
          setFriendBtnLabel('Friends');
          setAcceptedFriendReq(true);
        }
      } else if (status === 404) {
        setFriendBtnLabel('User not found');
        setAcceptedFriendReq(true);
      } else {
        // Error getting profile detail for checking if friends
        errorHandler(response, status, 3004);
      }
    });
  }

  const handleFriendAccepted = (event) => {
    event.preventDefault();
    if (acceptedFriendReq === false) {
      setAcceptedFriendReq(true);
      setFriendBtnLabel('Loading...');
      // Get anything in the description starting with @
      const match = notif.description.match(/(@[a-z]+)/gm)[0];
      const senderUsername = match.substring(1, match.length);
  
      // Accept friend request
      apiProfileFriendToggle(senderUsername, 'friend', (response, status) => {
        if (status === 200) {
          setFriendBtnLabel('Friends')
        } else {
          // Error accepting friend request
          errorHandler(response, status, 3005);
        }
      });
    }
  }

  return (
    <div className='mb-3'>
      <small className='mb-0 text-secondary'>{timeSince(new Date(notif.timestamp)) + ' ago'}</small>
      <h4 className='mb-0'>
        <span style={{color: 'green'}}>{read ? '' : '• '}</span>
        {notif.title}
      </h4>
      <ReactMarkdown source={notif.description} />
      {notif.category === 'friend_request' ?
        <Button
          onClick={handleFriendAccepted}
          size='sm'
          className='mt-2'
        >
          {friendBtnLabel}
        </Button> : ''}
    </div>
  );
}
