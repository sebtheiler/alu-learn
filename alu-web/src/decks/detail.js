import React from 'react';
import {EditButton, RedirectButton} from './buttons';
import default_profile_pic from '../images/default_profile_pic.jpg';

export function Deck(props) {
  const {deck} = props;
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  const path = window.location.pathname;
  const match = path.match(/(?<deckid>\d+)/);
  const urlDeckId = match ? match.groups.deckid : -1;

  const isDetail = `${deck.id}` === `${urlDeckId}`;

  const handleLink = (event) => {
    event.preventDefault();
    window.location.href = `/${deck.id}`;
  };

  if (deck.length === 0) {
    // Still not sure why this happens
    // Will need to investigate further
    return null;
  };

  return (<div className={className}>
    <div className='d-flex'>
      <div className='mx-1'>
        {/* {TODO: Load real profile picture, downscale static file to consume less bandwith} */}
        <img alt={deck.author.first_name + "'s profile picture"} src={default_profile_pic} height='40' width='40'></img>
      </div>
      <div className='col-11'>
        <p>
          {deck.author.first_name}{' '}
          {deck.author.last_name}{' '}
          @{deck.author.username}{' '}
        </p>
        <p>{deck.title}</p>
        <div className='btn btn-group px-0'>
          <EditButton deck={deck} />
          <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Add Cards', target: '_blank'}} />
          <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Browse', target: '_blank'}} />
          {isDetail === true ? null : <button className='btn btn-outline-primary mb-4 mr-1' onClick={handleLink}>View</button>}
        </div>
      </div>
    </div>
  </div>);
};