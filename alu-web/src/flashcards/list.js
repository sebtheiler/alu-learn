import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiFlashCardDelete} from '../lookup';
import {FlashCard} from './detail';

export function FlashCardsList(props) {
  const {deckId} = props;
  const [flashcards, setFlashCards] = useState([]);
  const [flashcardsDidSet, setFlashCardsDidSet] = useState(false);

  useEffect(() => {
    if (flashcardsDidSet === false) {
      const handleFlashCardListLookup = (response, status) => {
        if (status === 200) {
          setFlashCards(response.flashcards);
          setFlashCardsDidSet(true);
        } else {
          alert('There was an error');
        };
      };
      apiDeckDetail(deckId, handleFlashCardListLookup);
    };
  });

  return (<div className={props.className}>
           <a href='create/' className='text-decoration-none'><button className='btn btn-primary btn-block'>Create a new Flash Card</button></a>
           {flashcards.map((flashcard, index) => {
             // Functions for handling button presses
             const handleSuspend = (event) => {
              console.log('Suspending NOT IMPLEMENTED', flashcard.id, event)
              // TODO: api Suspending
             };

             const handleDelete = (_event) => {
              // TODO: Modal pop-up for confirmation?
              apiFlashCardDelete(deckId, flashcard.id);
              setFlashCardsDidSet(false);
             };
             return <FlashCard
                      flashcard={flashcard}
                      key={index}
                      number={index}
                      handleSuspend={handleSuspend}
                      handleDelete={handleDelete}
                    />;
           })}
          </div>);
};