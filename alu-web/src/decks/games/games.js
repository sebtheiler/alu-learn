import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MatchingGame } from './matching';
import { QuizGame } from './quiz';
import { apiGameFlashcards } from '../../lookup/lookup';
import { errorHandler } from '../../utils';

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
      if (!gameType) {
        setErrorMessage(`
Game type unspecified: you must specify "?game=..." in the URL. If this happened naturally, please let us know.
        `);
        return;
      }
      const numFlashcards = (() => {
        switch (gameType) {
          case 'MATCHING':
            return parseInt(urlParams.current.get('size'))**2 / 2;
          case 'QUIZ':
            return parseInt(urlParams.current.get('num'));
          default:
            return 0;
        }
      })();
      if (!numFlashcards) {
        setErrorMessage(`
Failed to calclate required number of flashcards.  You may need "?size=N" or "?num=N" in the URL.  If this happened naturally, please let us know.
        `);
        return;
      }

      const options = (() => {
        switch (flashcardType) {
          case 'TAG':
            return {tag: urlParams.current.get('tag')};
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
  }, [flashcardsDidSet, flashcards, deckId, randomOrder, flashcardType, gameType, urlParams]);
  const game = (() => {
    switch (gameType) {
      case 'MATCHING':
        return <MatchingGame flashcards={flashcards} size={urlParams.current.get('size')} />
      case 'QUIZ':
        return <QuizGame flashcards={flashcards} numQuestions={parseInt(urlParams.current.get('num'))} />
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