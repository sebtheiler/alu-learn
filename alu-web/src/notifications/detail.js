import React from 'react';

export function Notification(props) {
  const {notif, read} = props;

  return (
    <div className={'mb-3' + (read ? '' : ' font-weight-bold')}>
      <h4 className='mb-0'>{(read ? '' : '• ') + notif.title}</h4>
      <p className='mb-0'>{notif.description}</p>
      {/* <button className='btn btn-primary btn-sm '>Add Friend</button> */}
    </div>
  );
};