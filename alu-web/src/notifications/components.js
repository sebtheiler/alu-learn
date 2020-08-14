import React, {useState, useEffect} from 'react';
import {Popover, OverlayTrigger, Button} from 'react-bootstrap';

import {Notification} from './detail';
import {apiNotificationList, apiNotificationRead} from '../lookup';

export function NotificationComponent(props) {
  const {username} = props;
  const [notifList, setNotifList] = useState([]);
  const [didGetNotifs, setDidGetNotifs] = useState(false);
  const [viewedNotifs, setViewedNotifs] = useState(false);
  // Lookup notifications in API
  if (didGetNotifs === false) {
    apiNotificationList(username, (response, status) => {
      if (status === 200) {
        setNotifList(response.slice(0, 10).reverse());
        setDidGetNotifs(true);
      } else {
        console.log(response, status);
        alert('Error displaying notifications');
      };
    });
  };

  useEffect(() => {
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
  });

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
        <Button onClick={(event) => {event.preventDefault(); setViewedNotifs(true);}} variant='primary'>Notifications</Button>
      </OverlayTrigger>
    </div>
  );
};