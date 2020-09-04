import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiFlashCardDelete, apiFlashCardSuspendLeech} from '../../lookup';
import {FlashCard} from './detail';
// import {Button, ButtonGroup} from 'react-bootstrap';
import { errorHandler } from '../../utils';
import {DeckDefaultButtonGroup} from '../buttons';

export function FlashCardsList(props) {
  // deckId: Specify a deck ID to get and display flashcards from
  // flashcardList: If not deckId, specify a raw list of flashcards
  // foreignUser: True if a user who does not own the deck is viewing it
  // showParnetDeckTitle: If True, show the title of the deck for each flashcard
  const {deckId, flashcardList, foreignUser, showParentDeckTitle} = props;
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashCards] = useState([]);
  const [flashcardsDidSet, setFlashCardsDidSet] = useState(false);

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
        apiDeckDetail(deckId, (response, status) => {
          if (status === 200) {
            setFlashCardsDidSet(true);
            setDeck(response);
            setFlashCards(response.flashcards);
          } else {
            // Error looking up deck
            errorHandler(response, status, 2002);
          };
        });
      } else {
        // If flashcards were directly passed
        setFlashCardsDidSet(true);
        setFlashCards(flashcardList);
      };
    };
  }, [flashcardsDidSet, flashcardList, deckId]);

  return (
    <div className={props.className}>
      <div className='text-center'>
        {flashcardList || foreignUser || !deck ? null :
          <DeckDefaultButtonGroup deck={deck} hideBrowse={true} />
        }
      </div>
      {flashcards.map((flashcard, index) => {
        // Functions for handling button presses
        // This is defined individually for each displayed flashcard
        const handleSuspend = (event) => {
          event.preventDefault();
          const action = flashcard.is_suspended ? 'unsuspend' : 'suspend';
          apiFlashCardSuspendLeech(flashcard.parent_deck_id, flashcard.id, action, (response, status) => {
            if (status === 200) {
              // TODO: This might cause *slight* performance issues
              flashcard.is_suspended = action === 'suspend';
              setFlashCardsDidSet(false);
            } else {
              // Error suspending/leeching flashcard
              errorHandler(response, status, 2003);
            };
          });
        };

        const handleDelete = (event) => {
          // TODO: Modal pop-up for confirmation?
          event.preventDefault();
          apiFlashCardDelete(flashcard.parent_deck_id, flashcard.id, (response, status) => {
            if (status === 200) {
              flashcards.splice(index);
              setFlashCardsDidSet(false);
            } else {
              // Error deleting flashcard
              errorHandler(response, status, 2004);
            };
          });
        };
        return <FlashCard
                flashcard={flashcard}
                key={index}
                number={index}
                showParentDeckTitle={showParentDeckTitle}
                handleSuspend={handleSuspend}
                handleDelete={handleDelete}
                foreignUser={foreignUser}
              />;
      })}
    </div>
  );
};