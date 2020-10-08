import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiDeckFlashcards} from '../../lookup';
import {FlashCard} from './detail';
import { errorHandler } from '../../utils';
import {DeckDefaultButtonGroup} from '../buttons';
import { Button } from 'react-bootstrap';

export function FlashCardsList(props) {
  // deckId: Specify a deck ID to get and display flashcards from
  // flashcardList: If not deckId, specify a raw list of flashcards
  // foreignUser: True if a user who does not own the deck is viewing it
  // showParnetDeckTitle: If True, show the title of the deck for each flashcard
  const {deckId, flashcardList, showParentDeckTitle, artificialPaginationNumFlashcards} = props;
  const isForeignUser = typeof props.foreignUser === 'string' ? props.foreignUser.toLowerCase() === 'true' : props.foreignUser;
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashCards] = useState([]);
  const [flashcardsDidSet, setFlashCardsDidSet] = useState(false);
  const [nextUrl, setNextUrl] = useState(null);
  const [flashcardsLoading, setFlashCardsLoading] = useState(false);
  const [artificialPaginationNumFlashcardsShown, setArtificialPaginationNumFlashcardsShown] = useState(artificialPaginationNumFlashcards);

  useEffect(() => {
    // Re-renders flashcardList whenever updated, if specified
    // Does not re-render when browsing list
    if (flashcardList) {
      setFlashCardsDidSet(false);
    };
  }, [flashcardList, setFlashCardsDidSet]);

  useEffect(() => {
    if (flashcardsDidSet === false) {
      if (!flashcardList) {
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
          };
        });
        apiDeckFlashcards(deckId, {}, (response, status) => {
          // Get flashcards
          if (status === 200) {
            setNextUrl(response.next);
            setFlashCardsDidSet(true);
            setFlashCards(response.results);
          } else if (status === 403) {
            window.location.href = `/decks/${deckId}/`;
          } else {
            // Error looking up deck's flashcards
            errorHandler(response, status, 1016);
          };
        });
      } else {
        // If flashcards were directly passed
        setFlashCardsDidSet(true);
        setFlashCards(flashcardList);
      };
    };
  }, [flashcardsDidSet, flashcardList, deckId]);

  // Handle next set of flashcards (pagination)
  const handleLoadNext = (event) => {
    event.preventDefault();
    setFlashCardsLoading(true);
    if (artificialPaginationNumFlashcards) {
      setArtificialPaginationNumFlashcardsShown(artificialPaginationNumFlashcardsShown + artificialPaginationNumFlashcards);
      setFlashCardsLoading(false);
    } else {
      if (nextUrl !== null && flashcardsLoading === false) {
        apiDeckFlashcards(deckId, {}, (response, status) => {
          if (status === 200) {
            setNextUrl(response.next);
            const newFlashcards = [...flashcards].concat(response.results);
            setFlashCards(newFlashcards);
          } else {
            // Error handling next set of flashcards (pagination)
            errorHandler(response, status, 1018);
          };
          setFlashCardsLoading(false);
        }, nextUrl);
      };
    };
  };

  return (
    <div className={props.className}>
      {flashcardList ? null : <h2 className='text-center mt-3'>Browsing Flashcards{deck ? ` in "${deck.title}"` : null}</h2>}
      <div className='text-center'>
        {!(flashcardList || isForeignUser || !deck) &&
          <DeckDefaultButtonGroup deck={deck} hideBrowse={true} />
        }
      </div>
      {flashcards.length > 0 ? flashcards.slice(0, artificialPaginationNumFlashcardsShown).map((flashcard, index) => {
        return <FlashCard
                flashcard={flashcard}
                key={index}
                number={index}
                showParentDeckTitle={showParentDeckTitle}
                suspendCallback={() => setFlashCardsDidSet(false)}
                deleteCallback={() => {flashcards.splice(index); setFlashCardsDidSet(false);}}
                foreignUser={isForeignUser}
                hideSuspend={!!deckId}
              />
      }) :
        <p className='text-center mt-3'>
          {flashcardsDidSet ? 'This deck has no flashcards yet.' : 'Loading...'}
        </p>}
      {(nextUrl || (artificialPaginationNumFlashcards && flashcardList.length > artificialPaginationNumFlashcardsShown)) && 
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
};