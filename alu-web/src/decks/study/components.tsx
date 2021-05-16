import React, { useState, useEffect, useMemo } from 'react';
import {
  apiFlashCardSuspendLeech,
  apiFlashCardDelete,
  apiSSMDetail,
  apiSSMFlashcards,
  apiSSMFlashcardUpdate,
} from '../../lookup';
import { StudyElement } from './study';
import { getAnkiInterval } from './algorithm'
import Button from 'react-bootstrap/Button';
import { errorHandler, QuestionBubble, updateURLParameter, useApiObjectHook } from '../../utils';
import BrowserInteractionTime from 'browser-interaction-time';
import { FlashCard, SSMInterface } from '../types';

type SSMFlashcardsReturn = {flashcards: FlashCard[], num_overflow: number};
export function StudyComponent({ studySessionManagerId }) {
  // Params
  const reviewOverflowBucket = useMemo(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('reviewOverflowBucket') === 'true';
  }, []);

  // States
  const [notFound, setNotFound] = useState(false);
  const [numOverflow, setNumOverflow] = useState<number | undefined>(undefined);
  const [flashcards, setFlashcards] = useApiObjectHook<FlashCard[]>(
    apiSSMFlashcards,
    [200, 404], 5001,
    [studySessionManagerId, reviewOverflowBucket],
    (response: SSMFlashcardsReturn, status: number) => {
      setNotFound(status === 404);
      setNumOverflow(response.num_overflow);
    },
    (response: SSMFlashcardsReturn) => response.flashcards,
  );
  const [SSM] = useApiObjectHook<SSMInterface>(
    apiSSMDetail,
    [200, 404], 5000,
    [studySessionManagerId],
    (_response, status: number) => setNotFound(status === 404),
  );

  return (
    <StudyLogicComponent
      SSM={SSM}
      flashcards={flashcards}
      setFlashcards={setFlashcards}
      numOverflow={numOverflow}
      notFound={notFound}
    />
  );
}


interface StudyLogicComponentProps {
  SSM?: SSMInterface;
  flashcards?: FlashCard[];
  setFlashcards?(newFlashcards: any): void;
  notFound?: boolean;
  isAssignment?: boolean;
  numOverflow?: number;
  updateReviewInfo?: boolean;
}
export function StudyLogicComponent(props: StudyLogicComponentProps) {
  const { SSM, flashcards, setFlashcards, notFound, isAssignment, numOverflow, updateReviewInfo=true } = props;

  // Track time
  const browserInteractionTime = useMemo(() => {
    const timer = new BrowserInteractionTime({
      idleTimeoutMs: 30000,
    });
    timer.startTimer();

    return timer;
  }, []);


  // Keep track of what flashcard the user is seeing
  const [currentCard, setCurrentCard] = useState<FlashCard>();
  const [currentCardDidSet, setCurrentCardDidSet] = useState(false);
  const [previousCard, setPreviousCard] = useState<FlashCard>();

  // Other states
  const [showAnswer, setShowAnswer] = useState(false);
  const [finishedStudying, setFinishedStudying] = useState(false);
  const [message, setMessage] = useState<{ variant?: string, content?: string }>({});

  // Get which card should appear
  useEffect(() => {
    if (flashcards && SSM && currentCardDidSet === false) {
      // If there are no more cards, we've finished
      if (flashcards.length === 0) {
        setFinishedStudying(true);
        return;
      } else if (flashcards.length === 1) {
        setCurrentCard(flashcards[0]);
        setCurrentCardDidSet(true);
        setShowAnswer(false);
        return;
      }
      const unseenCards = flashcards.filter(
        flashcard => flashcard.learning_status.toUpperCase() === 'UNSEEN'
      );

      // Decide if we should show an unseen card, or review an old card
      const showUnseenCard = Math.random() < (unseenCards.length / flashcards.length);

      if (showUnseenCard) {
        // Get random, unseen, card that is not the previous card
        console.log('Looking for unseen card')
        let card: FlashCard;
        do {
          card = unseenCards[Math.floor(Math.random() * unseenCards.length)];
        } while (previousCard ? (card.id === previousCard.id) : false);
        setCurrentCard(card);
      } else {
        console.log('Looking for seen card')
        // Get earliest card that has already been seen, and is not the previous card
        let earliestFlashcard: FlashCard | undefined=undefined;
        let flashcard: FlashCard;
        for (flashcard of flashcards) {
          if (!earliestFlashcard || (flashcard.next_review < earliestFlashcard.next_review &&
              flashcard.learning_status.toUpperCase() !== 'UNSEEN' &&
              (!previousCard || flashcard.id !== previousCard.id)
              )) {
                earliestFlashcard = flashcard;
              }
            }
        setCurrentCard(earliestFlashcard);
      }
      setShowAnswer(false);
      setCurrentCardDidSet(true);
    }
  }, [currentCardDidSet, flashcards, previousCard, SSM]);

  // Shows answer when spacebar is pressed or "Show Answer" is clicked
  const showAnswerHandler = (event) => {
    event.preventDefault();
    setShowAnswer(true);
  }

  // Inform backend of grade
  const backendGradeUpdate = (grade) => {
    if (grade > 4 || grade < 1 || !currentCard || !SSM || !flashcards || !setFlashcards)
      return;
    setPreviousCard(currentCard);
    setCurrentCardDidSet(false);

    // Calculate when the card should be next seen
    const wasLeech = currentCard.is_leech;
    const {scheduling_algorithm, difficulty, review_ahead_minutes} = SSM;
    const {nextReviewDate, interval, easeFactor, isMinute, learningStatus, stepsIndex, leechIndex, isLeech}
      = getAnkiInterval(currentCard, grade, scheduling_algorithm, difficulty);

    if (interval !== -1) {
      // Update date in SSM
      if (updateReviewInfo) {
        apiSSMFlashcardUpdate(
          SSM.id,
          currentCard.id,
          nextReviewDate.toISOString(),
          isMinute ? 0 : interval,
          easeFactor,
          learningStatus,
          stepsIndex,
          leechIndex,
          isLeech,
          currentCard.learning_status === 'UNSEEN', // incrementNewCardsDoneToday
          new Date().getTimezoneOffset(), // timezoneOffset
          browserInteractionTime.getTimeInMilliseconds(), // timeTaken
          (response, status) => {
            if (status === 200) {
              // setCurrentCardDidSet(true);
            } else {
              // Error updating flashcard with information returned from studying
              errorHandler(response, status, 5002);
            }
            browserInteractionTime.reset();
            browserInteractionTime.startTimer();
        });
      }
      // Update date locally
      let flashcardsCopy = flashcards;
      const index = flashcardsCopy.map(e => e.id).indexOf(currentCard.id);

      if ((isMinute ? interval : interval*60*24) > review_ahead_minutes) {
        // Get rid of the flashcard if we won't see it again soon
        flashcardsCopy.splice(index, 1);
      } else {
        // Edit the flashcard
        flashcardsCopy[index].next_review = nextReviewDate.toISOString();
        flashcardsCopy[index].interval = isMinute ? 0 : interval;
        flashcardsCopy[index].ease = easeFactor;
        flashcardsCopy[index].learning_status = learningStatus;
        flashcardsCopy[index].steps_index = stepsIndex;
      }
      setFlashcards(flashcardsCopy);

      // Display a message if the card is now a leech
      if (!wasLeech && isLeech) {
        setMessage({
          variant: 'danger',
          content: 'Flashcard automatically marked as a leech',
        });
        setTimeout(() => setMessage({}), 5000);
      }
    }
  }

  // Handle the user's keypresses
  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      // Show answer when spacebar is pressed
      setShowAnswer(true);

      // Unselect everything
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) activeElement.blur();
    } else if (isNaN(event.key) === false && showAnswer) {
      // Shortcuts for clicking 'Again', 'Hard', ...
      let grade = parseInt(event.key);

      const learningStatus = currentCard!.learning_status.toLowerCase();
      if (learningStatus === 'unseen' || learningStatus === 'learning') {//canceledBtns.toString() === 'Hard') {
        // If we are first learning the card
        // and the Hard button is obscured...
        if (grade === 2) {
          grade = 3;
        } else if (grade === 3) {
          grade = 4;
        } else if (grade > 3) {
          return;
        }
      } else if (learningStatus === 'relearning') {//(canceledBtns.toString() === 'Hard,Easy') {
        // If we are relearning the card and the Hard
        // and Easy buttons are obscured...
        if (grade === 2) {
          grade = 3;
        } else if (grade > 2) {
          return;
        }
      }

      backendGradeUpdate(grade);
      // Select the 'Show Answer' button
      try {
        const showAnswer = document.getElementById('showanswer');
        if (showAnswer) showAnswer.focus();
      } catch (e) { // happens when we are finished studiyng
        // pass
      }
    }
  }

  // Callback for when the user presses delete flashcard
  const flashcardDeleteCallback = (event) => {
    event.preventDefault();
    if (currentCard) {
      apiFlashCardDelete(currentCard.parent_deck_id, currentCard.flashcard_num, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error deleting flashcard while studying
          errorHandler(response, status, 2008);
        }
      });
    }
  }

  // Creates a function for marking the flashcard as suspended/leeched
  const flashcardLeechSuspendGenerator = (action) => {
    return (event) => {
      event.preventDefault();
      if (currentCard) {
        apiFlashCardSuspendLeech(currentCard.parent_deck_id, currentCard.id, action, (response, status) => {
          if (status === 200) {
            window.location.reload();
          } else {
            // Error marking flashcard as leech or suspending while studying
            errorHandler(response, status, 2002);
          }
        });
      }
    }
  }
  
  if (notFound) {
    return <p className='text-center'>Couldn't find this deck</p>
  } else if (!SSM) {
    return (<div className='text-center'>
      <p>Loading...</p>
      <p>(if this takes a while, it's because your deck is updating)</p>
    </div>);
  }

  return (
    <>
      {finishedStudying ?
        <div className='text-center'>
          <p>Congratulations! You've finished studying these flashcards!</p>
          <p>Come back tomorrow to continue reviewing flashcards!</p>
          {numOverflow ? <>
            <Button
              onClick={() => window.location.href = updateURLParameter(
                window.location.href,
                'reviewOverflowBucket',
                true,
              )}
              variant='success'
              className='mb-3'
            >
              Review Overflow Bucket ({numOverflow} flashcards){' '}
              <QuestionBubble>
                The "Overflow Bucket" contains reviews for flashcards more than a day past ideal review.
                This was introduced so that reviews would not pile-up too high if you missed a day.
                Make sure to study the Overflow Bucket at your leisure to slowly cut down
                the number of flashcards in it, and continue remembering old information.
              </QuestionBubble>
            </Button><br />
          </> : null /* the ?: syntax is just to prevent the number 0 from appearing */}
          {isAssignment ?
            <Button href='/home/' id='assignments-home-btn'>
              Assignments Home
            </Button>
          :
            <Button href='/home/decks/' id='decks-home-btn'>
              Decks Home
            </Button>
          }
          {SSM.deck_id &&
            <Button href={`/decks/${SSM.deck_id}/flashcards/create/`}>
              Create a new flashcard
            </Button>
          }
        </div>
        : (currentCard &&
          <div>
            <StudyElement
              currentCard={currentCard}
              showAnswer={showAnswer}
              message={message}
              showAnswerHandler={showAnswerHandler}
              backendGradeUpdate={backendGradeUpdate}
              handleKeyDown={handleKeyDown}
              deleteFlashCardHandler={flashcardDeleteCallback}
              leechsuspendFlashCardGenerator={flashcardLeechSuspendGenerator}
              schedulingAlgorithm={SSM.scheduling_algorithm}
              deckDifficulty={SSM.difficulty}
              numRemainingFlashcards={flashcards && flashcards.length}
              numOverflow={numOverflow}
            />
          </div>
        )
      }
    </>
  );
}