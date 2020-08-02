import React from 'react';
import {EditButton, RedirectButton} from './buttons';

export function Deck(props) {
  const {deck} = props;
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  return (<div className={className}>
    <p>{deck.id} - {deck.title}</p>
    <div className='btn btn-group'>
      <EditButton deck={deck} />
      <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Add Cards', target: '_blank'}} />
      <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Browse', target: '_blank'}} />
    </div>
  </div>);
};