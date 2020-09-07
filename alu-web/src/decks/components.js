import React, {useState, useEffect} from 'react';
import {DeckCreate,} from './create';
import {DeckDetail} from './detail';
import {apiDeckDetail} from '../lookup';
import {DecksHomeList} from './home';
import {Button, ButtonGroup} from 'react-bootstrap';
import { errorHandler } from '../utils';


// Component for the decks shown on the user's homepage
export function DecksHomeComponent(props) {
  return (
    <div className={props.className}>
      <div className='text-center my-3'>
        <ButtonGroup>
          <Button href='/flashcards/search/'>Search for Flashcards / Custom Study</Button>
          <DeckCreate className='ml-1' />
          <Button className='ml-1' href='/decks/import/'>Import Deck</Button>
        </ButtonGroup>
      </div>
      <DecksHomeList {...props}/>
    </div>
  );
};

// Component for displaying an individual deck
export function DeckDetailComponent(props) {
  const {deckId, currentUsername} = props;
  const [didLookup, setDidLookup] = useState(false);
  const [deck, setDeck] = useState(null);

  // Send a request to the API to get information about the given deck
  // `didLookup` is required so that this doesn't infinitely run
  useEffect(() => {
    if (didLookup === false) {
      apiDeckDetail(deckId, (response, status) => {
        if (status === 200) {
          setDeck(response);
        } else {
          // Error getting deck detail
          errorHandler(response, status, 1003);
        };
      });
      setDidLookup(true);
    };
  }, [deckId, didLookup, setDidLookup]);

  return deck === null ? null : (
    <DeckDetail
      deck={deck}
      currentUsername={currentUsername}
      textAlign='left'
    />
  );
};