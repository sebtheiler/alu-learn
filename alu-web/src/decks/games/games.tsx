import { MatchingGame } from './matching';
import { QuizGame } from './quiz';
import { ReviewInstance } from '../types';
import { apiGameFlashcards, gameFlashcardTypes } from '../../lookup/lookup';
import { errorHandler } from '../../utils';
import { useState, useEffect, useMemo } from 'react';

export function GameComponent({ deckId }) {
  const [flashcards, setFlashcards] = useState<ReviewInstance[]>();
  const [flashcardsDidSet, setFlashcardsDidSet] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Get data from URL
  const { gameType, flashcardType, randomOrder, size, num, tag } = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const size = urlParams.get('size');
    const num = urlParams.get('num');
    return {
      gameType: urlParams.get('game') as 'MATCHING' | 'QUIZ' | 'CRAM',
      flashcardType: urlParams.get('flashcards') as gameFlashcardTypes,
      randomOrder: urlParams.get('random') === 'true',
      size: (size && parseInt(size)) as number | undefined,
      num: (num && parseInt(num)) as number | undefined,
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
          case 'CRAM':
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
        if (flashcardType === 'TAG') {
          return { tag: tag }
        } else if (gameType === 'CRAM') {
          return { include_cloze: true };
        }

        return {};
      })();

      setFlashcardsDidSet(true);
      apiGameFlashcards(
        parseInt(deckId),
        flashcardType,
        numFlashcards,
        randomOrder,
        options,
        (response, status) => {
          if (status === 200) {
            if (response.length < numFlashcards && gameType !== 'CRAM') {
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
        },
      );
    }
  }, [flashcardsDidSet, flashcards, deckId, randomOrder, flashcardType, gameType, num, size, tag]);

  const game = (() => {
    if (!flashcards) return <p>Loading...</p>

    switch (gameType) {
      case 'MATCHING':
        if (!size) return;
        return <MatchingGame reviewInstances={flashcards} size={size} />
      case 'QUIZ':
        return <QuizGame reviewInstances={flashcards} numQuestions={num ?? 10} />
      case 'CRAM':
        // return <CramGame initialFlashcards={flashcards} />
        // TODO: delete Cram after creating new study system
        return <p>This game is temporarily disabled</p>
      default:
        return <p>Unrecognized Game</p>
    }
  })();

  return (
    <div className='text-center container-fluid w-90 mb-5'>
      <h1 className='mt-5'>Playing</h1>
      {errorMessage ? <p>{errorMessage}</p> : game}
    </div>
  );
}
