import Button from 'react-bootstrap/Button';
import ReactMarkdown from 'react-markdown';
import { Notification } from '../types';
import { apiProfileFriendToggle, apiProfileDetail } from '../../lookup';
import { timeSince } from '../../utils';
import { useMemo, useState } from 'react';

interface NotificationProps {
  notif: Notification;
  read: boolean;
}
export function RenderNotification({ notif, read }: NotificationProps) {
  const [friendBtnLabel, setFriendBtnLabel] = useState('Add Friend');
  const [acceptedFriendReq, setAcceptedFriendReq] = useState(false);
  const senderUsername = useMemo(() => {
      // Get the username by looking for anything that starts with "@"
      const usernameSearch = notif.description.match(/(@[a-z0-9]+)/gm);
      if (!usernameSearch) return;

      return usernameSearch[0].substring(1, usernameSearch[0].length);
  }, [notif]);

  useMemo(() => {
    if (notif.category === 'friend_request' && notif.description && senderUsername) {
      apiProfileDetail(senderUsername).then(profile => {
        if (profile.is_friend) {
          setFriendBtnLabel('Friends');
          setAcceptedFriendReq(true);
        }
      });
    }
  }, [notif, senderUsername]);

  const handleFriendAccepted = (event) => {
    event.preventDefault();
    if (acceptedFriendReq === false && senderUsername) {
      setAcceptedFriendReq(true);
      setFriendBtnLabel('Loading...');
      apiProfileFriendToggle(senderUsername, 'friend').then(
        () => setFriendBtnLabel('Friends'),
      );
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
          className='mt-2 notif-friend-btn'
        >
          {friendBtnLabel}
        </Button> : ''}
    </div>
  );
}
