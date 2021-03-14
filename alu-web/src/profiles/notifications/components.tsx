import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';

import { RenderNotification } from './detail';
import { apiNotificationList, apiNotificationRead } from '../../lookup';
import { errorHandler, useApiObjectPaginationHook } from '../../utils';
import { Notification } from '../types';

import './components.css';

interface NotificationComponentProps {
  username: string;
  isPopup: boolean;
}
export function NotificationComponent(props: NotificationComponentProps) {
  const { username, isPopup } = props;
  const [nextNotifsDidSet, setNextNotifsDidset] = useState(true);
  const [numUnreadNotifs, setNumUnreadNotifs] = useState(-1);
  const [totalUnreadNotifs, setTotalUnreadNotifs] = useState(-1);

  const [notifList, nextUrl, setNotifList, setNextUrl] = useApiObjectPaginationHook<Notification[]>(
    apiNotificationList,
    200, 3002,
    [],
    (response, _status) => {
      const unread = response.results.filter((notif: Notification) => 
        notif.read === false
      );
      setNumUnreadNotifs(unread.length);
      setTotalUnreadNotifs(response.total_unread);
    },
  );

  // Load next set of notifications (pagination)
  const handleLoadNext = (event) => {
    event.preventDefault();

    if (nextUrl && nextNotifsDidSet) {
      setNextNotifsDidset(false);
      apiNotificationList((response, status) => {
        if (status === 200) {
          setNextUrl(response.next);
          const newNotifs = [...notifList as Notification[]].concat(response.results);
          setNotifList(newNotifs);

          // Count new unread
          const unread = response.results.filter(notif =>
            notif.read === false
          );
          setNumUnreadNotifs(numUnreadNotifs + unread.length);
        } else {
          // Error handling next set of notifications (pagination)
          errorHandler(response, status, 3014);
        }
        setNextNotifsDidset(true);
      }, nextUrl as string);
    }
  }

  const markAllAsRead = (_event?) => {
    if (!notifList) return;
    const unreadNotifs = notifList.filter(
      notif => notif.read === false
    ).map(notif => notif.id);

    if (username.length > 0 && unreadNotifs.length > 0) {
      apiNotificationRead(
        unreadNotifs,
        (response, status) => {
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
    if (notifList) {
      const notifPopover = (
        <Popover id='notification-popover'>
          <Popover.Title as='h3'>Notifications</Popover.Title>
          <Popover.Content>
            <div id='notification-popover-list'>
              {notifList.length > 0 ? notifList.map((notif, index) =>
                <RenderNotification notif={notif} read={notif.read} key={index} />
              )
              :
              <p>You don't have any notifications yet</p>}
            </div>
            {!(username.length < 1 || notifList.length < 1) && <>
              <hr />
              <div>
                {totalUnreadNotifs !== undefined && <Button
                  href='/profiles/notifications/'
                  onClick={() => window.location.href = '/profiles/notifications/'}
                  variant='primary'
                  size='sm'
                >
                  See older notifications {(totalUnreadNotifs - numUnreadNotifs) > 0 &&
                  ` (${totalUnreadNotifs - numUnreadNotifs})`}
                </Button>}
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
                if (!totalUnreadNotifs || !numUnreadNotifs) return;
                setTotalUnreadNotifs(totalUnreadNotifs - numUnreadNotifs);
                setNumUnreadNotifs(0);

                // NOTE: For some reason, link clicking doesn't work
                // by default, so we need this annoying
                // workaround
                setTimeout(() => {
                  const links = 
                    document.getElementById('notification-popover-list')?.getElementsByTagName('a');

                  if (links) {
                    for (const link of links) {
                      link.onclick = _ => window.location.href = link.href;
                    }
                  }
                }, 250);
              }}
              style={{ transform: 'translate(2px, 1px)' }}
              className='p-0 notification-bell'
              size='sm'
            >
              {totalUnreadNotifs && totalUnreadNotifs > 0 ? <>
                <i className='fas fa-bell fa-2x' />
                <span className='notification-badge'>
                  {totalUnreadNotifs < 10 ? totalUnreadNotifs : '9+'}
                </span>
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
    console.log(nextUrl, totalUnreadNotifs, numUnreadNotifs)

    return (
      <div className='text-left mt-5 mx-auto container'>
        <h2>All Notifications</h2>
        {notifList && notifList.length > 0 ? notifList.map((notif, index) =>
          <RenderNotification notif={notif} read={notif.read} key={index} />
        )
        :
          <p>
            You don't have any notifications yet
          </p>
        }
        <div className='mb-2'>
          {nextUrl && totalUnreadNotifs !== undefined && numUnreadNotifs !== undefined &&
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
