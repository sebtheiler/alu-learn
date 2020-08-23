import React from 'react';
import default_profile_pic from '../images/default_profile_pic.jpg';
import {BadgeComponent} from '../profile-badges';


// Component for displaying a user's first and last name, and a clickable username
export function UserLink(props) {
  const {user, includeFullName, noLink} = props;
  const nameDisplay = includeFullName ? `${user.first_name} ${user.last_name} ` : null;

  // TODO: Refactor this component and use it more widely
  return (
    <>
      {nameDisplay}
      {/* eslint-disable-next-line */ /* This is so it doesn't complain about a null href*/}
      <a href={noLink ? null : `/profiles/u/${user.username}`}>@{user.username}</a>{' '}
      <BadgeComponent profile={user} showAll={true} />
    </>
  );
};


// Component for displaying a user's profile picture
export function UserPicture(props) {
  const {user} = props;
  
  return (<a href={`/profiles/u/${user.username}`}>
    <img alt={user.first_name + "'s profile picture"} src={default_profile_pic} height='40' width='40'></img>
  </a>);
};