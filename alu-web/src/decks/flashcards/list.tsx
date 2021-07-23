import React, { useState, useEffect, useMemo } from 'react';
import { apiDeckDetail, apiDeckFlashcards, apiRearrangeFlashcard } from '../../lookup';
import { RenderFlashCard } from './detail';
import { errorHandler, updateURLParameter } from '../../utils';
import { DeckDefaultButtonGroup, SelectFlashcardsButtonGroup } from '../buttons';
import Button from 'react-bootstrap/Button';
import { Deck, SharedDeck, ReviewInstance, FlashCard } from '../types';

// TODO: break this component into multiple components
interface FlashCardsListProps {
  deckId?: number;
  flashcardList?: FlashCard[] | ReviewInstance[];
  showParentDeckTitle?: boolean;
  artificialPaginationNumFlashcards?: number;
  fixSlateLazy?: boolean;
  foreignUser?: ('true' | 'false') | boolean;
  className?: string;
}
export function FlashCardsList(props: FlashCardsListProps) {
  // deckId: Specify a deck ID to get and display flashcards from
  // flashcardList: If not deckId, specify a raw list of flashcards
  // foreignUser: True if a user who does not own the deck is viewing it
  // showParnetDeckTitle: If True, show the title of the deck for each flashcard
  const {deckId, flashcardList, showParentDeckTitle, artificialPaginationNumFlashcards, fixSlateLazy} = props;
  const isForeignUser = typeof props.foreignUser === 'string' ? props.foreignUser.toLowerCase() === 'true' : props.foreignUser;
  const [deck, setDeck] = useState<Deck | SharedDeck>();
  const [flashcards, setFlashCards] = useState<ReviewInstance[] | FlashCard[]>([]);
  const [flashcardsDidSet, setFlashCardsDidSet] = useState(false);
  const [nextUrl, setNextUrl] = useState('');
  const [flashcardsLoading, setFlashCardsLoading] = useState(false);
  const [artificialPaginationNumFlashcardsShown, setArtificialPaginationNumFlashcardsShown] = useState(artificialPaginationNumFlashcards);
  const [movingFlashcard, setMovingFlashcard] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFlashcards, setSelectedFlashcards] = useState<string[]>([]);
  const [tagEditorModalIsOpen, setTagEditorModalIsOpen] = useState(false);
  const [totalFlashcardsNum, setTotalFlashcardsNum] = useState(0);
  const reverseOrder = useMemo(() => (
    !flashcardList &&
    new URLSearchParams(window.location.search).get('reverse') !== 'false'
  ), [flashcardList]);

  useEffect(() => {
    // Re-renders flashcardList whenever updated, if specified
    // Does not re-render when browsing list
    if (flashcardList) {
      setFlashCardsDidSet(false);
    }
  }, [flashcardList, setFlashCardsDidSet]);

  useEffect(() => {
    if (flashcardsDidSet === false) {
      if (!flashcardList && deckId) {
        // API lookup if given deck ID
        apiDeckDetail(deckId, {}, (response, status) => {
          // Get deck metadata
          if (status === 200) {
            setDeck(response);
          } else if (status === 403) {
            window.location.href = `/decks/${deckId}`;
          } else {
            // Error looking up deck
            errorHandler(response, status, 1015);
          }
        });
        apiDeckFlashcards(deckId, { reverse: reverseOrder }, (response, status) => {
          // Get flashcards
          if (status === 200) {
            setNextUrl(response.next);
            setFlashCardsDidSet(true);
            setFlashCards(response.results);
            setTotalFlashcardsNum(response.count);
          } else if (status === 403) {
            window.location.href = `/decks/${deckId}/`;
          } else {
            // Error looking up deck's flashcards
            errorHandler(response, status, 1016);
          }
        });
      } else {
        // If flashcards were directly passed
        setFlashCardsDidSet(true);
        if (flashcardList) setFlashCards(flashcardList);
      }
    }
  }, [flashcardsDidSet, flashcardList, deckId, reverseOrder]);

  // Handle next set of flashcards (pagination)
  const handleLoadNext = (event) => {
    event.preventDefault();
    setFlashCardsLoading(true);
    if (artificialPaginationNumFlashcards && artificialPaginationNumFlashcardsShown ) {
      setArtificialPaginationNumFlashcardsShown(
        artificialPaginationNumFlashcardsShown + artificialPaginationNumFlashcards
      );
      setFlashCardsLoading(false);
    } else {
      if (nextUrl !== null && flashcardsLoading === false) {
        apiDeckFlashcards(deckId, {reverse: reverseOrder}, (response, status) => {
          if (status === 200) {
            setNextUrl(response.next);
            const newFlashcards = [...flashcards].concat(response.results);
            setFlashCards(newFlashcards);
          } else {
            // Error handling next set of flashcards (pagination)
            errorHandler(response, status, 1018);
          }
          setFlashCardsLoading(false);
        }, nextUrl);
      }
    }
  }

  const moveFlashcard = (direction: 'UP' | 'DOWN', index: number, flashcard: FlashCard) => {
    // Reverse the direction to be moved if the flashcard list is reversed
    const trueDirection = !reverseOrder ? direction : (
      direction === 'UP' ? 'DOWN' : 'UP'
    );

    return (event => {
      event.preventDefault();
      console.log(trueDirection)
      if (!movingFlashcard && deckId) {
        setMovingFlashcard(true);
        apiRearrangeFlashcard(deckId, flashcard.flashcard_num, trueDirection, (response, status) => {
          if (status === 200) {
            let otherFlashcard = direction === 'UP' ? flashcards[index - 1] : flashcards[index + 1];
            if (trueDirection === 'UP') {
              flashcard.flashcard_num--;
              otherFlashcard.flashcard_num++;
            } else {
              flashcard.flashcard_num++;
              otherFlashcard.flashcard_num--;
            }

            // This uses `direction` instead of `trueDirection` since
            // no matter the real direction the flashcard is going
            // it always appears to be moving the same way
            const newFlashcards = direction === 'UP' ? [
              ...flashcards.slice(0, index - 1),
              flashcard,
              otherFlashcard,
              ...flashcards.slice(index + 1),
            ] : [
              ...flashcards.slice(0, index),
              otherFlashcard,
              flashcard,
              ...flashcards.slice(index + 2),
            ];
            setFlashCards(newFlashcards);
            setMovingFlashcard(false);
          } else {
            // Error moving flashcard
            errorHandler(response, status, 2009);
          }
        });
      }
    });
  }

  return (
    <div className={props.className}>
      {flashcardList ? null : <h2 className='text-center mt-3'>Browsing Flashcards{deck ? ` in "${deck?.title}"` : null}</h2>}
      <div className='text-center'>
        {!(flashcardList || isForeignUser || !deck || deck.serializer_name === 'shared_deck') && <>
          <DeckDefaultButtonGroup deck={deck} hideBrowse={true} />
          <br />
          <SelectFlashcardsButtonGroup
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            selectedFlashcards={selectedFlashcards}
            setSelectedFlashcards={setSelectedFlashcards}
            tagEditorModalIsOpen={tagEditorModalIsOpen}
            setTagEditorModalIsOpen={setTagEditorModalIsOpen}
          />
        </>}
        {deck && deck.deck_type === 'shared' &&
          <Button href={`/decks/${deckId}/`}>Shared Deck Page</Button>
        }
        <br /><br />
        {deck && <Button href={updateURLParameter(window.location.href, 'reverse', !reverseOrder)}>
          Sort {reverseOrder ? 'Ascending' : 'Descending'}
        </Button>}
      </div>
      {flashcards.length > 0 ? flashcards.slice(0, artificialPaginationNumFlashcardsShown).map((flashcard, index) => {
        return (
          <RenderFlashCard
            flashcard={flashcard}
            key={index}
            number={reverseOrder ? totalFlashcardsNum - index : index + 1}
            showParentDeckTitle={showParentDeckTitle}
            suspendCallback={() => setFlashCardsDidSet(false)}
            deleteCallback={() => {
              const newFlashcards = [...flashcards.slice(0, index), ...flashcards.slice(index + 1)];
              setFlashCards(newFlashcards);
            }}
            foreignUser={isForeignUser}
            hideSuspend={!!deckId}
            fixSlateLazy={fixSlateLazy ?? !!deckId}
            moveUp={(index !== 0 && deck?.deck_type === 'standard')
              ? moveFlashcard('UP', index, flashcard)
            : undefined}
            moveDown={(index !== flashcards.length - 1 && deck?.deck_type === 'standard')
              ? moveFlashcard('DOWN', index, flashcard)
            : undefined}
            onChecked={selectionMode ? (event => {
              if (event.target.checked) {
                // Add the flashcard's id to the list
                setSelectedFlashcards([...selectedFlashcards, flashcard.id]);
              } else {
                // Remove the flashcard's id from the list
                setSelectedFlashcards(selectedFlashcards.filter(flashcardId => flashcardId !== flashcard.id));
              }
            }) : undefined}
            showButtons={deck ? !deck['sharing_setting'] : !!flashcardList}
          />
        );
      }) :
        <p className='text-center mt-3'>
          {flashcardsDidSet ? 'This deck has no flashcards yet.' : 'Loading...'}
        </p>}
      {(
        nextUrl || (
        artificialPaginationNumFlashcards && artificialPaginationNumFlashcardsShown &&
        flashcardList && flashcardList.length > artificialPaginationNumFlashcardsShown)
      ) && 
        <Button
          onClick={handleLoadNext}
          variant='outline-primary'
          block
          className='mb-5'
        >
          {flashcardsLoading ? 'Loading...' : 'Load more Flashcards'}
        </Button>
      }
    </div>
  );
}
