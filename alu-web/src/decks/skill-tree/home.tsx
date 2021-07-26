import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import DeckSelection from './deck-selection';
import SkillTree from './skill-tree';
import { useApiObjectHook } from '../../utils';
import { apiDeckPrivateList } from '../../lookup';
import { Deck } from '../types';
import './home.css';
import { useObjectList } from '../../lookup/lookup';  // TODO: clean up imports

type DeckAction = 'CREATE' | 'EDIT' | 'DELETE';
const deckReducer = (
  state: Deck[] | undefined,
  event: { action: DeckAction, payload: Deck[] | undefined },
): Deck[] | undefined => {
  if (!state) return undefined;
  switch (event.action) {
    case 'CREATE':
      return [...state, (event.payload as Deck[])[0]];
    case 'EDIT':
      return state; // TODO
    case 'DELETE':
      return state; // TODO
    default:
      return state;
  }
}
export function SkillTreeHome() {
  const [decks, decksDispatch] = useObjectList(
    'decks', 'deck',
    deckReducer,
  );
  console.log(decks)
  const [selectedDeck, setSelectedDeck] = useState<number | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDeckUrl = urlParams.get('selected');
    if (selectedDeckUrl !== null)
      return parseInt(selectedDeckUrl);
    else
      return null;
  });

  return (
    <Container className='text-center mt-3' fluid>
      <Row>
        <Col md={3} sm={12}>
          {decks ? decks.map((deck, i) =>
            <DeckSelection
              deck={deck}
              onClick={() => setSelectedDeck(i)}
              selected={selectedDeck === i}
              key={i}
            />
          ) : <p>Loading decks...</p>}
        </Col>
        <Col md={6} sm={12}>
          {selectedDeck === null || !decks ? <>
            <h1>Welcome!</h1>
            <p>Choose a deck on the left to start studying</p>
            <br />
            <p>daily goal and stats?</p>
          </> :
            <SkillTree
              deck={decks[selectedDeck]}
              selectedDeck={selectedDeck}
            />
          }
        </Col>
        <Col md={3} sm={12}>
          <p>meta stuff goes here</p>
        </Col>
      </Row>
    </Container>
  );
}