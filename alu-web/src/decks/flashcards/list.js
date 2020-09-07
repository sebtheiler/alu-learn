import React, {useState, useEffect} from 'react';
import {apiDeckDetail} from '../../lookup';
import {FlashCard} from './detail';
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
      {flashcardList ? null : <h2 class='text-center mt-3'>Browsing Flashcards{deck ? ` in "${deck.title}"` : null}</h2>}
      <div className='text-center'>
        {flashcardList || foreignUser || !deck ? null :
          <DeckDefaultButtonGroup deck={deck} hideBrowse={true} />
        }
      </div>
      {flashcards.length > 0 ? flashcards.map((flashcard, index) => {
        return <FlashCard
                flashcard={flashcard}
                key={index}
                number={index}
                showParentDeckTitle={showParentDeckTitle}
                suspendCallback={() => setFlashCardsDidSet(false)}
                deleteCallback={() => {flashcards.splice(index); setFlashCardsDidSet(false);}}
                foreignUser={foreignUser}
              />;
      }) :
        <p className='text-center mt-3'>
          {flashcardsDidSet ? 'This deck has no flashcards yet.' : 'Loading...'}
        </p>}
    </div>
  );
};