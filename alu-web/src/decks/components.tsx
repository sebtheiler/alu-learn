import React, { useState, useEffect } from 'react';
import { DeckCreate } from './create';
import { DeckDetail } from './detail';
import { apiSharedDeckDetail, apiDeckFlashcards } from '../lookup';
import { DecksHomeList } from './home';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { errorHandler } from '../utils';
import { SharedDeck, FlashCard } from './types';


// Component for the decks shown on the user's homepage
export function DecksHomeComponent(props) {
  return (
    <div className={props.className}>
      <div className='text-center my-3'>
        <ButtonGroup>
          <Button href='/flashcards/search/'>Search for Flashcards</Button>
          <DeckCreate className='ml-1' />
          <Button className='ml-1' href='/decks/import/'>Import Deck</Button>
        </ButtonGroup>
      </div>
      <DecksHomeList {...props}/>
    </div>
  );
}

// Component for displaying an individual deck
export function DeckDetailComponent({ deckId, currentUsername }) {
  const [didLookup, setDidLookup] = useState(false);
  const [deck, setDeck] = useState<SharedDeck>();
  const [flashcards, setFlashcards] = useState<FlashCard[]>();
  const [totalFlashcardNum, setTotalFlashcardNum] = useState<number>();
  const [isForbidden, setIsForbidden] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Send a request to the API to get information about the given deck
  // `didLookup` is required so that this doesn't infinitely run
  useEffect(() => {
    if (didLookup === false) {
      apiSharedDeckDetail(deckId, (response, status) => {
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
        }
      });
      apiDeckFlashcards(deckId, { limit: 10 }, (response, status) => {
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
        }
      });
      setDidLookup(true);
    }
  }, [deckId, didLookup]);

  return !deck ?
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
}