import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import RenderFlashcard from './render-flashcard';
import { useObjectPaginatedList } from '../../lookup/lookup';
import { capitalize } from '../../utils';
import { FlashCard } from '../types';
import './view-flashcards.scss';
import { uncleanTag } from './sub-section';

export default function ViewFlashcards({ deckId, section='', }: { deckId?: number, section?: string }) {
  const [flashcards, , fetchNext] = useObjectPaginatedList<FlashCard>('decks', 'flashcard', undefined, {
    deck_id: deckId,
    tags: uncleanTag(section),
  });

  if (!flashcards) return <p className='text-center'>Loading…</p>
  return (<Container>
    <div className='mt-5 mb-3 text-center'>
      <h1>
        Viewing Flashcards
        {section.length > 0 && <>: {capitalize(section.replaceAll('-', ' ').replaceAll('__', ' - '), true)}</>}
      </h1>
      <ButtonGroup>
        <Button
          href={`/deck/${deckId}/study/` + (section.length > 0 ? `${section}/` : '')}
          className='mr-1'
          style={{ width: '200px' }}
        >
          Study
        </Button>
        <Button
          href={`/deck/${deckId}/flashcards/create/${section}/`}
          style={{ width: '200px' }}
        >
          Create Flashcards
        </Button>
      </ButtonGroup>
    </div>
    {flashcards.map(flashcard =>
      <RenderFlashcard flashcard={flashcard} key={flashcard.id} />
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
