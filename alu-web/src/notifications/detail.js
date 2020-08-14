import React from 'react';
import {timeSince} from './utils';

export function Notification(props) {
  const {notif, read} = props;

  return (
    <div className='mb-3'>
      <small className='mb-0 text-secondary'>{timeSince(new Date(notif.timestamp)) + ' ago'}</small>
      <h4 className='mb-0'>
        <span style={{color: 'green'}}>{read ? '' : '• '}</span>
        {notif.title}
      </h4>
      <p className='mb-0'>{notif.description}</p>
      {/* <button className='btn btn-primary btn-sm '>Add Friend</button> */}
    </div>
  );
};