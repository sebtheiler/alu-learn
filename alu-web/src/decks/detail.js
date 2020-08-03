import React from 'react';
import {EditButton, RedirectButton} from './buttons';

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

  return (<div className={className}>
    <p>{deck.id} - {deck.title}</p>
    <div className='btn btn-group'>
      <EditButton deck={deck} />
      <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Add Cards', target: '_blank'}} />
      <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Browse', target: '_blank'}} />
      {isDetail == true ? null : <button className='btn btn-outline-primary mb-4 mr-1' onClick={handleLink}>View</button>}
    </div>
  </div>);
};