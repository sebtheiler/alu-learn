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

export function SkillTreeHome({ username }: { username: string }) {
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
            <h1 className='invisible'>.</h1>
            <div
              className='deck-selection-item'
              role='button'
              onClick={() => setSelectedDeck(null)}
            >
              <div
                className={'deck-selection-main mb-0' + (selectedDeck === null ? ' selected' : '')}
              >
                <span className='mb-0'>Home</span>
                <span>
                  <i className='fas fa-home fa-2x float-left mt-2 ml-2' />
                </span>
              </div>
            </div>
            <hr />
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
          <Col md={6} sm={12} className='px-4'>
            {selectedDeck === null || !decks ? <HomeComponent username={username} /> :
              <SkillTree deck={decks[selectedDeck]} />
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