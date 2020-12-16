import React from 'react';
import { BadgeComponent } from './badges';


// Component for displaying a user's first and last name, and a clickable username
export function UserLink(props) {
  const {user, hideFullName, noLink, showAllBadges, hideBadges, small} = props;

  const main = (
    <>
      {hideFullName ? null : `${user.first_name} ${user.last_name} `}
      {/* eslint-disable-next-line */ /* This is so it doesn't complain about a null href*/}
      <a href={noLink ? null : `/profiles/u/${user.username}`}>@{user.username}</a>{' '}
      {hideBadges ? null : <BadgeComponent profile={user} showAll={showAllBadges} />}
    </>
  );

  return (
    <div>
      {small ? <small className='text-secondary'>{main}</small> : main}
    </div>
  );
}
