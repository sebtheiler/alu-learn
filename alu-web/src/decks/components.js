import React, {useState, useEffect} from 'react';
import {DeckCreate,} from './create';
import {DeckDetail} from './detail';
import {apiDeckDetail, apiDeckFlashcards} from '../lookup';
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
  const [flashcards, setFlashcards] = useState(null);
  const [totalFlashcardNum, setTotalFlashcardNum] = useState(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Send a request to the API to get information about the given deck
  // `didLookup` is required so that this doesn't infinitely run
  useEffect(() => {
    if (didLookup === false) {
      apiDeckDetail(deckId, { getFullDetail: true }, (response, status) => {
        if (status === 200) {
          setDeck(response);
          setIsForbidden(false);
        } else if (status === 403) {
          setIsForbidden(true);
        } else if (status === 404) {
          setNotFound(true);
          setIsForbidden(false);
        } else {
          // Error getting deck detail
          errorHandler(response, status, 1003);
        };
      });
      apiDeckFlashcards(deckId, {limit: 10}, (response, status) => {
        if (status === 200) {
          setFlashcards(response.results);
          setTotalFlashcardNum(response.count);
          setIsForbidden(false);
        } else if (status === 403) {
          setIsForbidden(true);
        } else if (status === 404) {
          setNotFound(true);
          setIsForbidden(false);
        } else {
          // Error getting deck flashcards
          errorHandler(response, status, 1014);
        };
      });
      setDidLookup(true);
    };
  }, [deckId, didLookup]);

  return deck === null ?
  <p className='text-center'>
      {(notFound ? 'It doesn\'t look like this deck exists.' : (isForbidden ? 'You are not allowed to view this deck.' : 'Loading...'))}
    </p>
    : (
      <DeckDetail
        deck={deck}
        flashcards={flashcards} numFlashcards={totalFlashcardNum}
        currentUsername={currentUsername}
        textAlign='left'
      />
  );
};