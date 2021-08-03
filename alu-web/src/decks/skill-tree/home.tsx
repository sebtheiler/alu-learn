import { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import DeckSelection from './deck-selection';
import SkillTree from './skill-tree';
import { DeckDispatch, deckReducer } from './context';
import HomeComponent from './home-component';
import Meta from './meta';
import CreateDeckButton from './buttons/create-deck';
import { useObjectList } from '../../lookup/lookup';  // TODO: clean up imports
import './home.scss';

export function SkillTreeHome({ defaultSelected }: { defaultSelected?: string }) {
  const [decks, decksDispatch] = useObjectList('decks', 'deck', deckReducer);
  const [selectedDeck, setSelectedDeck] = useState<number | null>(
    defaultSelected ? parseInt(defaultSelected) : null
  );

  return (
    <DeckDispatch.Provider value={decksDispatch}>
      <Container className='text-center mt-3' fluid>
        <Row>
          <Col md={3} sm={12}>
            <h1 className='invisible'>.</h1>
            <div className='deck-selection-item mb-4'>
              <div
                className={'deck-selection-main mb-0' + (selectedDeck === null ? ' selected' : '')}
                role='button'
                onClick={() => {
                  setSelectedDeck(null);
                  window.history.pushState(`alu/home/`, 'Home', `/home/`);
                }}
              >
                <p>
                  <span className='title-text'>Home</span>
                  <span><i className='fas fa-home fa-2x float-left mt-2 ml-2' /></span>
                </p>
              </div>
            </div>
            {decks ? decks.map(deck =>
              <DeckSelection
                deck={deck}
                onClick={() => {
                  setSelectedDeck(deck.id);
                  window.history.pushState(`alu/deck/${deck.id}/`, deck.title, `/deck/${deck.id}/`);
                }}
                selected={selectedDeck === deck.id}
                key={deck.id}
              />
            ) : <p>Loading decks...</p>}
            <CreateDeckButton />
          </Col>
          <Col md={6} sm={12} className='px-4'>
            {selectedDeck === null && !defaultSelected ?
              <HomeComponent />
              : (decks ?
                <SkillTree deck={decks.filter(deck => deck.id === selectedDeck)[0]} />
                :
                <p>Loading...</p>
              )
            }
          </Col>
          <Col md={3} sm={12}>
            <h1 className='invisible'>.</h1>
            <Meta />
          </Col>
        </Row>
      </Container>
    </DeckDispatch.Provider>
  );
}