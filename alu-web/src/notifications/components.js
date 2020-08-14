import React, {useState, useEffect} from 'react';
import {Popover, OverlayTrigger, Button} from 'react-bootstrap';

import {Notification} from './detail';
import {apiNotificationList, apiNotificationRead} from '../lookup';

export function NotificationComponent(props) {
  const {username} = props;
  const [notifList, setNotifList] = useState([]);
  const [didGetNotifs, setDidGetNotifs] = useState(false);
  const [viewedNotifs, setViewedNotifs] = useState(false);
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
          setNotifList(response.slice(0, 10).reverse());
          setDidGetNotifs(true);
          
          // Check if there are any unread notifications
          const unread = response.filter((notif) => {
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

  useEffect(() => {
    // If the user has opened their notifications,
    // then when they leave the page mark all the
    // notifications as read.
    // Ideally this would be done when the popover
    // is closed, but I'm not sure how to do that.
    if (viewedNotifs) {
      const markAllAsRead = (event) => {
        event.preventDefault();
        for (let notif of notifList) {
          if (notif.read === false) {
            apiNotificationRead(notif.profile.username, notif.id, (response, status) => {
              if (status === 200) {
                // ...
              } else {
                console.log(response, status);
                alert('Error in notifications!')
              }
            });
          };
        };
      };
  
      window.addEventListener('beforeunload', markAllAsRead);
      return () => {
        window.removeEventListener('beforeunload', markAllAsRead)
      };
    };
  }, [viewedNotifs, notifList]);

  const notifPopover = (
    <Popover id='notification-popover'>
      <Popover.Title as='h3'>Notifications</Popover.Title>
      <Popover.Content>
        {notifList.map((notif, index) => {
          return <Notification notif={notif} read={notif.read} key={index} />
        })}
      </Popover.Content>
    </Popover>
  );


  return (
    <div>
      <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={notifPopover}>
        <Button
          onClick={(event) => {event.preventDefault(); setViewedNotifs(true); setHasUnreadNotifs(false);}}
          variant={hasUnreadNotifs ? 'success' : 'secondary'}
          size='sm'
        >
          Notifications
        </Button>
      </OverlayTrigger>
    </div>
  );
};