import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MatchingGame } from './matching';
import { apiGameFlashcards } from '../../lookup/lookup';
import { shuffle, errorHandler } from '../../utils';

export function GameComponent(props) {
  const {deckId} = props;
  const [flashcards, setFlashcards] = useState(null);
  const [flashcardsDidSet, setFlashcardsDidSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Get data from URL
  const urlParams = useRef(null);
  useMemo(() => {
    urlParams.current = new URLSearchParams(window.location.search);
  }, []);
  const gameType = urlParams.current.get('game');
  const flashcardType = urlParams.current.get('flashcards');
  const randomOrder = urlParams.current.get('random') === 'true';

  useEffect(() => {
    if (!flashcardsDidSet) {
      const numFlashcards = (() => {
        switch (gameType) {
          case 'MATCHING':
            return parseInt(urlParams.current.get('size'))**2 / 2;
          default:
            return 0;
        }
      })();
      setFlashcardsDidSet(true);
      apiGameFlashcards(parseInt(deckId), flashcardType, numFlashcards, randomOrder, (response, status) => {
        if (status === 200) {
          if (response.length < numFlashcards) {
            setErrorMessage(`
You don't have enough flashcards to play this game.  You have ${response.length} flashcards, but ${numFlashcards} are required.
This may be due to the flashcard type requirements you listed: ${flashcardType}
`);
          }
          let randomOrder = [];
          for (const [i, flashcard] of response.entries()) {
            randomOrder.push([flashcard.deck_fields[0], i]);
            randomOrder.push([flashcard.deck_fields[1], i]);
          }
          randomOrder = shuffle(randomOrder);
          setFlashcards(randomOrder);
        } else {
          // Error getting flashcards for games
          errorHandler(response, status, 1027);
        }
      });
    }
  }, [flashcardsDidSet, flashcards, deckId, randomOrder, flashcardType, gameType, urlParams]);
  const game = (() => {
    switch (gameType) {
      case 'MATCHING':
        return <MatchingGame flashcards={flashcards} size={urlParams.current.get('size')} />
      default:
        return <p className='text-center'>Unrecognized Game</p>
    }
  })();

  return (<div className='container-fluid'>
    <h1 className='text-center mt-5'>Playing</h1>
    {errorMessage ? <p className='text-center'>{errorMessage}</p> :
    (flashcards ? game : <p className='text-center'>Loading...</p>)}
  </div>);
}