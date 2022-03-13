import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import RenderFlashcard, { FlashCardEvent } from './render-flashcard';
import { FlashCard } from './types';
import { capitalize, FormCheckbox } from '../utils';
import { replaceQueryParam } from './study/utils';
import { useMemo } from 'react';
import { useObjectPaginatedList } from '../lookup/lookup';
import './view-flashcards.scss';

const flashcardReducer = (state: FlashCard[] | undefined, event: FlashCardEvent) => {
  if (!state) return state;

  let newState = state;
  let indexOfFlashcard = newState.map(f => f.id).indexOf(event.flashcardId);
  switch (event.action) {
    case 'DELETE':
      newState = newState.filter(flashcard => flashcard.id !== event.flashcardId)
      return [...newState];
    case 'MOVE_UP':
      if (newState[indexOfFlashcard].order_num !== event.orderNum) break;

      newState[indexOfFlashcard].order_num--;
      newState[indexOfFlashcard - 1].order_num++;

      [
        newState[indexOfFlashcard - 1],
        newState[indexOfFlashcard],
      ] = [
        newState[indexOfFlashcard],
        newState[indexOfFlashcard - 1],
      ];

      return [...newState];
    case 'MOVE_DOWN':
      if (newState[indexOfFlashcard].order_num !== event.orderNum) break;

      newState[indexOfFlashcard].order_num++;
      newState[indexOfFlashcard + 1].order_num--;

      [
        newState[indexOfFlashcard],
        newState[indexOfFlashcard + 1],
      ] = [
        newState[indexOfFlashcard + 1],
        newState[indexOfFlashcard],
      ];

      return [...newState];
  }

  return [...newState];
}

interface ViewFlashcardsProps {
  deckId?: number;
  sharedDeckId?: number;
  snapshotId?: number;
  section?: string;
}
export default function ViewFlashcards({ deckId, sharedDeckId, snapshotId, section='', }: ViewFlashcardsProps) {
  const viewEssentialOnly = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewEssentialOnly = urlParams.get('viewEssentialOnly')?.toLowerCase() === 'true';
    return viewEssentialOnly;
  }, []);

  const [flashcards, dispatchFlashcards, fetchNext] = useObjectPaginatedList<FlashCard, FlashCardEvent>(
    sharedDeckId ? 'sharing_system' : 'decks',
    'flashcard',
    flashcardReducer,
    sharedDeckId ? {
      snapshot_id: snapshotId,
      shared_deck_id: sharedDeckId,
      section: section,
      view_essential_only: viewEssentialOnly,
    } : {
      deck_id: deckId,
      section: section,
      view_essential_only: viewEssentialOnly,
    },
  );

  const toggleViewEssentialOnly = () => {
    window.location.href = replaceQueryParam(
      'viewEssentialOnly',
      (!viewEssentialOnly).toString(),
      window.location.search,
    );
  }

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
      <br />
      {flashcards.filter(f => f.data.tags.includes('essential')).length > 0 &&
        <FormCheckbox
          className='mt-2'
          onChange={toggleViewEssentialOnly}
          defaultChecked={viewEssentialOnly}
        >
          View essential only?
        </FormCheckbox>
      }
    </div>
    {flashcards.map((flashcard, i) =>
      <RenderFlashcard
        flashcard={flashcard}
        dispatchFlashcards={dispatchFlashcards}
        deckId={deckId}
        orderNum={i}
        numFlashcards={flashcards.length}
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
