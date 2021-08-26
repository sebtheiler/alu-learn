import React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import RenderFlashcard from './render-flashcard';
import { useObjectPaginatedList } from '../../lookup/lookup';
import { capitalize } from '../../utils';
import { FlashCard } from '../types';
import './view-flashcards.scss';

interface ViewFlashcardsProps {
  deckId?: number;
  sharedDeckId?: number;
  snapshotId?: number;
  section?: string;
}
export default function ViewFlashcards({ deckId, sharedDeckId, snapshotId, section='', }: ViewFlashcardsProps) {
  const [flashcards, , fetchNext] = useObjectPaginatedList<FlashCard>(
    sharedDeckId ? 'sharing_system' : 'decks',
    'flashcard',
    undefined,
    sharedDeckId ? {
      snapshot_id: snapshotId,
      shared_deck_id: sharedDeckId,
      section: section,
    } : {
      deck_id: deckId,
      section: section,
    },
  );

  if (!flashcards) return <p className='text-center'>Loading…</p>
  return (<Container>
    <div className='mt-5 mb-3 text-center'>
      <h1>
        Viewing Flashcards
        {section.length > 0 && <>: {capitalize(section.replaceAll('-', ' ').replaceAll('__', ' - '), true)}</>}
      </h1>
      <ButtonGroup>
        {sharedDeckId ? <>
          <Button
            href={`/community/deck/${sharedDeckId}/`}
            style={{ width: '200px' }}
          >
            Shared Deck Page
          </Button>
        </> : <>
          <Button
            href={`/deck/${deckId}/study/` + (section.length > 0 ? `${section}/` : '')}
            className='mr-1'
            style={{ width: '200px' }}
          >
            Study
          </Button>
          <Button
            href={section ? `/deck/${deckId}/flashcards/create/${section}/` : `/deck/${deckId}/flashcards/create/`}
            style={{ width: '200px' }}
          >
            Create Flashcards
          </Button>
        </>}
      </ButtonGroup>
    </div>
    {flashcards.map(flashcard =>
      <RenderFlashcard
        flashcard={flashcard}
        deckId={deckId}
        key={flashcard.id}
      />
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
