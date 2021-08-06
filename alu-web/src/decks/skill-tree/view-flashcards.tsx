import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useObjectPaginatedList } from '../../lookup/lookup';
import { capitalize, RenderRichText } from '../../utils';
import { FlashCard } from '../types';
import './view-flashcards.scss';
import { uncleanTitle } from './sub-section';

export default function ViewFlashcards({ deckId, tags='', }: { deckId?: number, tags?: string }) {
  const [flashcards, , fetchNext] = useObjectPaginatedList<FlashCard>('decks', 'flashcard', undefined, {
    deck_id: deckId,
    tags: uncleanTitle(tags),
  });

  if (!flashcards) return <p className='text-center'>Loading…</p>
  return (<Container>
    <div className='mt-5 mb-3 text-center'>
      <h1>
        Viewing Flashcards
        {tags.length > 0 && <>: {capitalize(tags.replaceAll('-', ' ').replaceAll('__', ' - '), true)}</>}
      </h1>
      <ButtonGroup>
        <Button
          href={`/deck/${deckId}/study/` + (tags.length > 0 ? `${tags}/` : '')}
          className='mr-1'
          style={{ width: '200px' }}
        >
          Study
        </Button>
        <Button
          href={`/deck/${deckId}/flashcards/create/` + (tags.length > 0 ? `?tags=${tags}` : '')}
          style={{ width: '200px' }}
        >
          Create Flashcards
        </Button>
      </ButtonGroup>
    </div>
    {flashcards.map(flashcard =>
      <div
        className='flashcard-view'
        key={flashcard.id}
        role='button'
      >
        <Row className='flashcard-head'>
          <Col>
            <span>Flashcard #{flashcard.flashcard_num + 1}: {capitalize(flashcard.flashcard_type)}</span>
            <span className='float-right'>{flashcard.tags}</span>
          </Col>
        </Row>
        <Row className='flashcard-body'>
          {flashcard.fields.map((field, i) =>
            <Col
              md={12/flashcard.fields.length}
              className={'flashcard-field' + (i !== flashcard.fields.length - 1 ? ' divider' : '')}
              key={i}
            >
              <div className='text'>
                <RenderRichText text={field} />
              </div>
            </Col>
          )}
        </Row>
      </div>
    )}
    {flashcards.length === 0 && <p className='text-center'>
      {deckId ? <>
        This deck has no flashcards yet
      </> : <>No flashcards yet</>}
    </p>}
    {fetchNext && <Button onClick={fetchNext} className='mb-5' block>
      Load More
    </Button>}
  </Container>);
}
