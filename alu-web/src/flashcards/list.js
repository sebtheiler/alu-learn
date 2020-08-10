import React, {useState, useEffect} from 'react';
import {apiDeckDetail} from '../lookup';
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
           {flashcards.map((flashcard, index) => {
             return <FlashCard flashcard={flashcard} key={index} number={index} />;
           })}
          </div>);
};