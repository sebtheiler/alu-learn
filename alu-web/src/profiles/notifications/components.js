import React, {useState, useEffect} from 'react';
import {Popover, OverlayTrigger, Button} from 'react-bootstrap';

import {Notification} from './detail';
import {apiNotificationList, apiNotificationRead} from '../../lookup';
import { errorHandler } from '../../utils';

import './components.css';

export function NotificationComponent(props) {
  const {username, isPopup} = props;
  const [notifList, setNotifList] = useState([]);
  const [notifsDidSet, setNotifsDidSet] = useState(false);
  const [numUnreadNotifs, setNumUnreadNotifs] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);

  // Lookup notifications in API
  useEffect(() => {
    if (notifsDidSet === false) {
      if (username === '') {
        // If the user is not logged in make a fake notification
        setNotifList([{
          title: 'Hey there!',
          description: "Welcome to Alu! Alu uses spaced reptition algorithms to help you learn and study most effectively. Learn more at [here](/help/tutorial/).",
          read: false,
          category: 'basic',
          timestamp: (new Date()).toISOString(),
          id: -1,
        }]);
        setNotifsDidSet(true);
        setNumUnreadNotifs(1);
      } else {
        // If the user is logged in, get notifications
        apiNotificationList(username, (response, status) => {
          if (status === 200) {
            setNextUrl(response.next);
            setNotifList(response.results.splice(0, isPopup ? 5 : 10000));
            setNotifsDidSet(true);
            
            // Check if there are any unread notifications
            const unread = response.results.filter((notif) => {
              return notif.read === false;
            });
            setNumUnreadNotifs(unread.length);
          } else {
            // Error getting notification list
            errorHandler(response, status, 3002);
          };
        });
      };
    };
  }, [notifsDidSet, isPopup, username]);

  // Load next set of notifications (pagination)
  const handleLoadNext = (event) => {
    event.preventDefault();
    if (nextUrl !== null) {
      apiNotificationList(username, (response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          const newNotifs = [...notifList].concat(response.results);
          setNotifList(newNotifs);
        } else {
          // Error handling next set of notifications (pagination)
          errorHandler(response, status, 3014);
        };
      }, nextUrl);
    };
  };

  const markAllAsRead = (_event) => {
    if (username.length > 0) {
      for (let notif of notifList) {
        if (notif.read === false) {
          apiNotificationRead(notif.profile.username, notif.id, (response, status) => {
            if (status === 200) {
              // ...
            } else {
              // Error marking notification as read
              errorHandler(response, status, 3003);
            };
          });
        };
      };
    };
  };

  const notifPopover = (
    <Popover id='notification-popover'>
      <Popover.Title as='h3'>Notifications</Popover.Title>
      <Popover.Content>
        <div>
          {notifList.length > 0 ? notifList.map((notif, index) => {
            return <Notification notif={notif} read={notif.read} key={index} />
          })
          :
          <p>You don't have any notifications yet</p>}
        </div>
        {username.length < 1 || notifList.length < 1 ? null : <>
          <hr />
          <div>
            <Button
              href='/profiles/notifications/'
              onClick={() => window.location.href = '/profiles/notifications/'}
              variant='primary'
              size='sm'
            >
              See older notifications
            </Button>
          </div>
        </>}
      </Popover.Content>
    </Popover>
  );

  if (isPopup) {
    return (
      <>
        <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={notifPopover} onExited={markAllAsRead}>
          <Button
            onClick={(event) => {event.preventDefault(); setNumUnreadNotifs(false);}}
            size='sm'
          >
            {numUnreadNotifs > 0 ? <>
              <i className='fas fa-bell fa-2x'></i>
              <span className='notification-badge'>{numUnreadNotifs < 10 ? numUnreadNotifs : '9+'}</span>
            </>:
              <i className='far fa-bell fa-2x'></i>
            }
          </Button>
        </OverlayTrigger>
      </>
    );
  } else {
    return (
      <div className='text-left mx-auto' style={{width: '75%'}}>
        <h2>All Notifications</h2>
        {notifList.map((notif, index) => {
          return <Notification notif={notif} read={notif.read} key={index} />
        })}
        <div className='mb-2'>
        {nextUrl !== null ?
          <Button
            onClick={handleLoadNext}
            variant='outline-primary'
          >
            Load more notifications
          </Button>
        : null}
      </div>
      </div>
    );
  };
};