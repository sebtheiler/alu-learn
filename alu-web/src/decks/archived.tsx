import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import DeckSelection from './deck-selection';
import Row from 'react-bootstrap/Row';
import SkillTree from './skill-tree';
import { Deck } from './types';
import { backendFetch, useAsyncState } from '../lookup/lookup';
import { useState } from 'react';

export default function ArchivedDecks() {
  const [decks] = useAsyncState<Deck[]>(() => backendFetch('GET', 'decks/deck/list', { is_archived: true }));
  const [selectedDeck, setSelectedDeck] = useState(-1);

  return (<Container className='text-center' fluid>
    <h1 className='text-center mt-5'>Archived Decks</h1>
    <hr />
    <Row>
      <Col md={3}>
        <h1 className='invisible'>.</h1>
        <div className='deck-selection-item mb-4'>
          <div
            className={'deck-selection-main mb-0' + (selectedDeck < 0 ? ' selected' : '')}
            role='button'
            onClick={() => setSelectedDeck(-1)}
          >
            <p>
              <span className='title-text'>Home</span>
              <span><i className='fas fa-home fa-2x float-left mt-2 ml-2' /></span>
            </p>
          </div>
        </div>
        {decks?.map(deck =>
          <DeckSelection
            deck={deck}
            onClick={() => setSelectedDeck(deck.id)}
            selected={selectedDeck === deck.id}
            key={`deck-${deck.id}`}
          />
        )}
      </Col>
      <Col md={6}>
        {selectedDeck > 0
          ? <SkillTree
              deck={decks?.filter(deck => deck.id === selectedDeck)[0]}
              readOnly
            />
          : (
            <div>
              <p>Archived decks are decks you are no longer using.  You can unarchive them at any time.</p>
              <ul style={{ display: 'inline-block', textAlign: 'left' }}>
                <li>To access this page, go to your profile page (top right dropdown), then click "Archived Decks"</li>
                <li>To archive a deck, go to the home page, double click the deck, click "Edit," then click "Archive"</li>
                <li>To unarchive a deck, double click the deck on this page, click "Edit," then click "Unarchive"</li>
              </ul>
            </div>
          )
        }
      </Col>
    </Row>
  </Container>);
}
