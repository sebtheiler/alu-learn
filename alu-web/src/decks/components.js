import React, {useEffect, useState} from 'react';
import {loadDecks} from '../lookup';

export function EditButton(props) {
  const {deck} = props;
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';

  // const handleClick = (event) => {
  //   event.preventDefault();
  //   window.location.href = link.href;
  // };

  return <button className={className}>Edit</button>;
};

export function RedirectButton(props) {
  const {deck, link} = props;
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
  const target = props.target ? props.target : '_blank';

  return <a href={link.href} target={target} rel='noopener noreferrer'><button className={className}>{link.display}</button></a>;
};

export function Deck(props) {
  const {deck} = props;
  const className = props.className ? props.className : 'col-10 mx-auto col-md-6';
  return <div className={className}>
    <p>{deck.id} - {deck.title}</p>
    <div className='btn btn-group'>
      <EditButton deck={deck} />
      <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Add Cards', target: '_blank'}} />
      <RedirectButton deck={deck} link={{href: 'https://www.google.com', display: 'Browse', target: '_blank'}} />
    </div>
  </div>;
};

export function DecksList(props) {
  const [decks, setDecks] = useState([]);
  
  useEffect(() => {
    const myCallback = (response, status) => {
      console.log(response, status)
      if (status === 200) {
        setDecks(response);
      };
    };
    loadDecks(myCallback);
  }, []);

  return decks.map((deck, index) => {
    return <Deck deck={deck} key={`${index}-${deck.id}`} className='my-5 py-5 border bg-white text-dark'/>;
  });
};