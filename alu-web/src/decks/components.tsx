import React from 'react';
import { DeckDetail } from './detail';
import { DecksHomeList } from './home';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { useApiObjectHook } from '../utils';
import { SharedDeck, FlashCard } from './types';
import { apiDeckFlashcards, useObjectGet } from '../lookup/lookup';


// Component for the decks shown on the user's homepage
export function DecksHomeComponent(props) {
  return (
    <div className={props.className}>
      <div className='text-center my-3'>
        <ButtonGroup>
          <Button href='/flashcards/search/'>Search for Flashcards</Button>
          <Button className='ml-1' href='/decks/import/'>Import Deck</Button>
        </ButtonGroup>
      </div>
      <DecksHomeList {...props}/>
    </div>
  );
}

// Component for displaying an individual deck
export function DeckDetailComponent({ deckId, currentUsername }) {
  const [deck] = useObjectGet<SharedDeck>('decks', 'deck', deckId);
  const [flashcardsResponse] = useApiObjectHook<{ results: FlashCard[], count: number}>(
    apiDeckFlashcards,
    200, 1014,
    [deckId, { limit: 10 }],
  );

  if (!deck) return 'Loading...';
  return (
    <DeckDetail
      deck={deck}
      flashcards={flashcardsResponse?.results}
      numFlashcards={flashcardsResponse?.count}
      currentUsername={currentUsername}
      textAlign='left'
    />
  );
}
