import React, { useState, useEffect } from 'react';
import { Popover, OverlayTrigger, Button } from 'react-bootstrap';

import { Notification } from './detail';
import { apiNotificationList, apiNotificationRead } from '../../lookup';
import { errorHandler } from '../../utils';

import './components.css';

export function NotificationComponent(props) {
  const {username, isPopup} = props;
  const [notifList, setNotifList] = useState([]);
  const [notifsDidSet, setNotifsDidSet] = useState(false);
  const [nextNotifsDidSet, setNextNotifsDidset] = useState(true);
  const [numUnreadNotifs, setNumUnreadNotifs] = useState(null);
  const [totalUnreadNotifs, setTotalUnreadNotifs] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);

  // Lookup notifications in API
  useEffect(() => {
    if (notifsDidSet === false) {
      if (username === '') {
        // If the user is not logged in make a fake notification
        const fakeNotifDesc = `
Welcome to Alu! Alu uses spaced repetition algorithms to help you learn and study most effectively.
`.trim();
        setNotifList([{
          title: 'Hey there!',
          description: fakeNotifDesc,
          read: false,
          category: 'basic',
          timestamp: (new Date()).toISOString(),
          id: -1,
        }]);
        setNotifsDidSet(true);
        setNumUnreadNotifs(1);
        setTotalUnreadNotifs(1);
      } else {
        // If the user is logged in, get notifications
        apiNotificationList(username, (response, status) => {
          if (status === 200) {
            setNextUrl(response.next);
            setNotifList(response.results);
            // setNotifList(response.results.splice(0, isPopup ? 5 : 10000));
            setNotifsDidSet(true);
            
            // Check if there are any unread notifications
            const unread = response.results.filter((notif) => {
              return notif.read === false;
            });
            setNumUnreadNotifs(unread.length);
            setTotalUnreadNotifs(response.total_unread);
          } else {
            // Error getting notification list
            errorHandler(response, status, 3002);
          }
        });
      }
    }
  }, [notifsDidSet, isPopup, username]);

  // Load next set of notifications (pagination)
  const handleLoadNext = (event) => {
    event.preventDefault();

    if (nextUrl !== null && nextNotifsDidSet) {
      setNextNotifsDidset(false);
      apiNotificationList(username, (response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          const newNotifs = [...notifList].concat(response.results);
          setNotifList(newNotifs);

          // Count new unread
          const unread = response.results.filter((notif) => {
            return notif.read === false;
          });
          setNumUnreadNotifs(numUnreadNotifs + unread.length);
        } else {
          // Error handling next set of notifications (pagination)
          errorHandler(response, status, 3014);
        }
        setNextNotifsDidset(true);
      }, nextUrl);
    }
  }

  const markAllAsRead = (_event) => {
    if (username.length > 0) {
      apiNotificationRead(username, notifList.filter(notif => notif.read === false).map(notif => notif.id), (response, status) => {
        if (status === 200) {
          // pass
        } else {
          // Error marking notifications as read
          errorHandler(response, status, 3003);
        }
      });
    }
  }
  
  if (isPopup) {
    if (notifsDidSet) {
      const notifPopover = (
        <Popover id='notification-popover'>
          <Popover.Title as='h3'>Notifications</Popover.Title>
          <Popover.Content>
            <div id='notification-popover-list'>
              {notifList.length > 0 ? notifList.map((notif, index) => {
                return <Notification notif={notif} read={notif.read} key={index} />
              })
              :
              <p>{notifsDidSet ? "You don't have any notifications yet" : "Loading..."}</p>}
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
                  See older notifications {(totalUnreadNotifs - numUnreadNotifs) > 0 &&
                  ` (${totalUnreadNotifs - numUnreadNotifs})`}
                </Button>
              </div>
            </>}
          </Popover.Content>
        </Popover>
      );

      return (
        <>
          <OverlayTrigger trigger='click' rootClose placement='bottom' overlay={notifPopover} onExited={markAllAsRead}>
            <Button
              onClick={(_event) => {
                setTotalUnreadNotifs(totalUnreadNotifs - numUnreadNotifs);
                setNumUnreadNotifs(0);

                // For some reason, link clicking doesn't work
                // by default, so we need this annoying
                // workaround
                setTimeout(() => {
                  const links = 
                    document.getElementById('notification-popover-list').getElementsByTagName('a');
                  
                  for (const link of links) {
                    link.onclick = _ => window.location.href = link.href;
                  }
                }, 250);
              }}
              style={{ transform: 'translate(2px, 1px)' }}
              className='p-0'
              size='sm'
            >
              {totalUnreadNotifs > 0 ? <>
                <i className='fas fa-bell fa-2x' />
                <span className='notification-badge'>{totalUnreadNotifs < 10 ? totalUnreadNotifs : '9+'}</span>
              </>:
                <i className='far fa-bell fa-2x' />
              }
            </Button>
          </OverlayTrigger>
        </>
      );
    } else {
      return null;
    }
  } else {
    // This doesn't effect the current display - only
    // for when the page is reloaded
    markAllAsRead();

    return (
      <div className='text-left mt-5 mx-auto container'>
        <h2>All Notifications</h2>
        {notifList.length > 0 ? notifList.map((notif, index) => {
          return <Notification notif={notif} read={notif.read} key={index} />
        })
        :
          <p>
            {notifsDidSet ? "You don't have any notifications yet" : "Loading..."}
          </p>
        }
        <div className='mb-2'>
        {nextUrl &&
          <Button
            onClick={handleLoadNext}
            variant='outline-primary'
          >
            {nextNotifsDidSet ? "Load more notifications" : "Loading..."}
            {(totalUnreadNotifs - numUnreadNotifs) > 0 &&
            ` (${totalUnreadNotifs - numUnreadNotifs})`}
          </Button>
        }
      </div>
      </div>
    );
  }
}
