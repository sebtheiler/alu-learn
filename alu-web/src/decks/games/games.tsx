import React, { useState, useEffect, useMemo } from 'react';
import { MatchingGame } from './matching';
import { QuizGame } from './quiz';
import { apiGameFlashcards, gameFlashcardTypes } from '../../lookup/lookup';
import { errorHandler } from '../../utils';
import { FlashCard } from '../types';

export function GameComponent({ deckId }) {
  const [flashcards, setFlashcards] = useState<FlashCard[]>();
  const [flashcardsDidSet, setFlashcardsDidSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Get data from URL
  const { gameType, flashcardType, randomOrder, size, num, tag } = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const size = urlParams.get('size');
    const num = urlParams.get('num');
    return {
      gameType: urlParams.get('game'),
      flashcardType: urlParams.get('flashcards') as gameFlashcardTypes,
      randomOrder: urlParams.get('random') === 'true',
      size: size && parseInt(size),
      num: num && parseInt(num),
      tag: urlParams.get('tag'),
    };
  }, []);

  useEffect(() => {
    if (!flashcardsDidSet && (size || num)) {
      if (!gameType) {
        setErrorMessage(`
Game type unspecified: you must specify "?game=..." in the URL. If this happened naturally, please let us know.
        `);
        return;
      }

      const numFlashcards = (() => {
        switch (gameType) {
          case 'MATCHING':
            if (!size) return;
            return size**2 / 2;
          case 'QUIZ':
            return num;
          default:
            return 0;
        }
      })();
      if (!numFlashcards && numFlashcards !== 0) {
        setErrorMessage(`
Failed to calculate required number of flashcards.  You may need "?size=N" or "?num=N" in the URL.  If this happened naturally, please let us know.
        `);
        return;
      }

      const options = (() => {
        switch (flashcardType) {
          case 'TAG':
            return { tag: tag };
          default:
            return {};
        }
      })();

      setFlashcardsDidSet(true);
      apiGameFlashcards(parseInt(deckId), flashcardType, numFlashcards, randomOrder, options, (response, status) => {
        if (status === 200) {
          if (response.length < numFlashcards) {
            setErrorMessage(`
You don't have enough flashcards to play this game.  You have ${response.length} flashcards, but ${numFlashcards} are required.
This may be due to the flashcard type requirements you listed: ${flashcardType}
            `);
          }
          setFlashcards(response);
        } else {
          // Error getting flashcards for games
          errorHandler(response, status, 1027);
        }
      });
    }
  }, [flashcardsDidSet, flashcards, deckId, randomOrder, flashcardType, gameType, num, size, tag]);
  const game = (() => {
    if (!flashcards) return <p>Loading...</p>;
    switch (gameType) {
      case 'MATCHING':
        if (!size) return;
        return <MatchingGame flashcards={flashcards} size={size} />
      case 'QUIZ':
        return <QuizGame flashcards={flashcards} numQuestions={num} />
      default:
        return <p className='text-center'>Unrecognized Game</p>
    }
  })();

  return (
    <div className='container-fluid w-90 mb-5'>
      <h1 className='text-center mt-5'>Playing</h1>
      {errorMessage ? <p className='text-center'>{errorMessage}</p> :
      (flashcards ? game : <p className='text-center'>Loading...</p>)}
    </div>
  );
}