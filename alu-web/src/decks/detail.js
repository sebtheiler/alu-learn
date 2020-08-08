import React from 'react';
import {EditButton, RedirectButton} from './buttons';
import {UserPicture, UserLink} from '../profiles';


// Display an individual deck
// This will be heavily revamped in the future
// to look more like a deck and less like a Tweet
export function Deck(props) {
  const {deck} = props; // JSON data with attributes such as `id` and `author`
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  
  // If this is a detail view, i.e., we are not looking at a list of other decks,
  // we do not want to display a link to this deck (since we already there)
  const path = window.location.pathname;
  const match = path.match(/(?<deckid>\d+)/);
  const urlDeckId = match ? match.groups.deckid : -1;
  const isDetail = `${deck.id}` === `${urlDeckId}`;

  if (deck.length === 0) {
    // Still not sure why this happens
    // Will need to investigate further
    return null;
  };

  return (<div className={className}>
    <div className='d-flex'>
      <div className='mx-1'>
        <UserPicture user={deck.author} />
      </div>
      <div className='col-11'>
        <p>
          <UserLink user={deck.author} includeFullName />
        </p>
        <p>{deck.title}</p>
        <div className='btn btn-group px-0'>
          <EditButton deck={deck} />
          <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Add Cards', target: '_blank'}} />
          <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Browse', target: '_blank'}} />
          {isDetail === true ? null : <a href={`/${deck.id}`}>
                                        <button className='btn btn-outline-primary mb-4 mr-1'>View</button>
                                      </a>}
        </div>
      </div>
    </div>
  </div>);
};