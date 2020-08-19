import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiFlashCardDelete, apiFlashCardSuspendLeech} from '../lookup';
import {FlashCard} from './detail';
import {Button, ButtonGroup} from 'react-bootstrap';

export function FlashCardsList(props) {
  const {deckId, flashcardList} = props;
  const [flashcards, setFlashCards] = useState([]);
  const [flashcardsDidSet, setFlashCardsDidSet] = useState(false);

  useEffect(() => {
    if (flashcardsDidSet === false && !flashcardList) {
      // API lookup if given deck ID
      apiDeckDetail(deckId, (response, status) => {
        if (status === 200) {
          setFlashCardsDidSet(true);
          setFlashCards(response.flashcards);
        } else {
          alert('There was an error');
        };
      });
    } else if (flashcardList) {
      // If flashcards were directly passed
      setFlashCardsDidSet(true);
      setFlashCards(flashcardList);
    };
  }, [flashcardsDidSet, flashcardList, deckId]);

  return (
    <div className={props.className}>
      <div className='text-center'>
        {flashcardList ? null :
        <ButtonGroup>
          <Button href='create/' className='mx-1'>Create a new flash card</Button>
          <Button href={`/${deckId}/study/`} className='mx-1'>Study this deck</Button>
        </ButtonGroup>
        }
      </div>
      {flashcards.map((flashcard, index) => {
        // Functions for handling button presses
        const handleSuspend = (event) => {
          event.preventDefault();
          const action = flashcard.is_suspended ? 'unsuspend' : 'suspend';
          apiFlashCardSuspendLeech(deckId, flashcard.id, action, (response, status) => {
            if (status === 200) {
              // TODO: This might cause *slight* performance issues
              setFlashCardsDidSet(false);
            } else {
              console.log(response, status);
              alert('Error suspending/leeching flashcard');
            }
          });
        };

        const handleDelete = (event) => {
          // TODO: Modal pop-up for confirmation?
          event.preventDefault();
          apiFlashCardDelete(deckId, flashcard.id, () => {
            setFlashCardsDidSet(false);
          });
        };
        return <FlashCard
                flashcard={flashcard}
                key={index}
                number={index}
                handleSuspend={handleSuspend}
                handleDelete={handleDelete}
              />;
      })}
    </div>
  );
};