import React from 'react';
import default_profile_pic from '../images/default_profile_pic.jpg';


// Component for displaying a user's first and last name, and a clickable username
export function UserLink(props) {
  const {user, includeFullName, noLink} = props;
  const nameDisplay = includeFullName === true ? `${user.first_name} ${user.last_name} ` : null;

  return (
    <React.Fragment>
      {nameDisplay}
      {noLink === true ? `@${user.username}` : <a href={`/profiles/u/${user.username}`}>@{user.username}</a>}
    </React.Fragment>);
};


// Component for displaying a user's profile picture
export function UserPicture(props) {
  const {user} = props;
  
  return (<a href={`/profiles/u/${user.username}`}>
    <img alt={user.first_name + "'s profile picture"} src={default_profile_pic} height='40' width='40'></img>
  </a>);
};