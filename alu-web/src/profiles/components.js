import React from 'react';
import default_profile_pic from '../images/default_profile_pic.jpg';

export function UserLink(props) {
  const {user, includeFullName, noLink} = props;
  const nameDisplay = includeFullName === true ? `${user.first_name} ${user.last_name} ` : null;

  const handleUserLink = (event) => {
    event.preventDefault();
    window.location.href = `/profiles/u/${user.username}`;
  };

  return (<React.Fragment>
    {nameDisplay}
    <span onClick={noLink ? null : handleUserLink}>@{user.username}</span>
  </React.Fragment>);
};

export function UserPicture(props) {
  const {user} = props;
  
  return (<img alt={user.first_name + "'s profile picture"} src={default_profile_pic} height='40' width='40'></img>);
};