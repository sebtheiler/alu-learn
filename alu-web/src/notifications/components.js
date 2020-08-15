import React, {useState} from 'react';
import {Popover, OverlayTrigger, Button} from 'react-bootstrap';

import {Notification} from './detail';
import {apiNotificationList, apiNotificationRead} from '../lookup';

export function NotificationComponent(props) {
  const {username} = props;
  const [notifList, setNotifList] = useState([]);
  const [didGetNotifs, setDidGetNotifs] = useState(false);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);

  // Lookup notifications in API
  if (didGetNotifs === false) {
    if (username === '') {
      // If the user is not logged in make a fake notification
      setNotifList([{
        title: 'Hey there!',
        description: 'Welcome to Alu! Alu uses spaced reptition algorithms to help you learn and study most effectively. Learn more at TODO',
        read: false,
        category: 'basic',
        timestamp: (new Date()).toISOString(),
        id: -1,
      }]);
      setDidGetNotifs(true);
      setHasUnreadNotifs(true);
    } else {
      // If the user is logged in, get notifications
      apiNotificationList(username, (response, status) => {
        if (status === 200) {
          const numNotifs = 5;
          setNotifList(response.slice(0, numNotifs).reverse());
          setDidGetNotifs(true);
          
          // Check if there are any unread notifications
          const unread = response.slice(0, numNotifs).reverse().filter((notif) => {
            return notif.read === false;
          });
          if (unread.length > 0) {
            setHasUnreadNotifs(true);
          };
        } else {
          console.log(response, status);
          alert('Error displaying notifications');
        };
      });
    };
  };

  const markAllAsRead = (_event) => {
    for (let notif of notifList) {
      if (notif.read === false) {
        apiNotificationRead(notif.profile.username, notif.id, (response, status) => {
          if (status === 200) {
            // ...
          } else {
            console.log(response, status);
            alert('Error in notifications!')
          };
        });
      };
    };
  };

  const notifPopover = (
    <Popover id='notification-popover'>
      <Popover.Title as='h3'>Notifications</Popover.Title>
      <Popover.Content>
        <div>
          {notifList.map((notif, index) => {
            return <Notification notif={notif} read={notif.read} key={index} />
          })}
        </div>
        <hr></hr>
        <div>
          <Button href='/notifications/' variant='primary' size='sm'>See older notifications</Button>
        </div>
      </Popover.Content>
    </Popover>
  );


  return (
    <div>
      <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={notifPopover} onExited={markAllAsRead}>
        <Button
          onClick={(event) => {event.preventDefault(); setHasUnreadNotifs(false);}}
          variant={hasUnreadNotifs ? 'success' : 'secondary'}
          size='sm'
        >
          Notifications
        </Button>
      </OverlayTrigger>
    </div>
  );
};