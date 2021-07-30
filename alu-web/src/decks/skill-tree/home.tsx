import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import DeckSelection from './deck-selection';
import SkillTree from './skill-tree';
import { DeckDispatch, deckReducer } from './context';
import { CreateDeckButton } from './buttons/create-deck';
import { useObjectList } from '../../lookup/lookup';  // TODO: clean up imports
import './home.css';

export function SkillTreeHome() {
  const [decks, decksDispatch] = useObjectList('decks', 'deck', deckReducer);
  const [selectedDeck, setSelectedDeck] = useState<number | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDeckUrl = urlParams.get('selected');
    if (selectedDeckUrl !== null)
      return parseInt(selectedDeckUrl);
    else
      return null;
  });

  return (
    <DeckDispatch.Provider value={decksDispatch}>
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
            {decks && decks.length > 0 ? <hr /> : null}
            <CreateDeckButton />
          </Col>
          <Col md={6} sm={12}>
            {selectedDeck === null || !decks ? <>
              <h1>Welcome!</h1>
              <p>Choose a deck on the left to start studying</p>
              <br />
              <p>daily goal and stats?</p>
            </> :
              <SkillTree deck={decks[selectedDeck]} />
            }
          </Col>
          <Col md={3} sm={12}>
            <p>meta stuff goes here</p>
          </Col>
        </Row>
      </Container>
    </DeckDispatch.Provider>
  );
}