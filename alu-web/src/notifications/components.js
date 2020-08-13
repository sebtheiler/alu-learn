import React, {useState} from 'react';
import {Popover, OverlayTrigger, Button} from 'react-bootstrap';

import {Notification} from './detail';
import {apiNotificationList} from '../lookup';

export function NotificationComponent(props) {
  const {username} = props;
  const [notifList, setNotifList] = useState([]);
  const [didGetNotifs, setDidGetNotifs] = useState(false);
  // Lookup notifications in API
  if (didGetNotifs === false) {
    apiNotificationList(username, (response, status) => {
      if (status === 200) {
        setNotifList(response);
        setDidGetNotifs(true);
      } else {
        console.log(response, status);
        alert('Error displaying notifications');
      };
    });
  };

  const notifPopover = (
    <Popover id='notification-popover'>
      <Popover.Title as='h3'>Notifications</Popover.Title>
      <Popover.Content>
        {notifList.map((notif, index) => {
          return <Notification notif={notif} key={index} />
        })}
      </Popover.Content>
    </Popover>
  );


  return (
    <div>
      <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={notifPopover}>
        <Button variant='primary'>Notifications</Button>
      </OverlayTrigger>
    </div>
  );
};