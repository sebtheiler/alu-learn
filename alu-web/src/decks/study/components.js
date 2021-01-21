import React, { useState, useEffect } from 'react';
import {
  apiFlashCardSuspendLeech,
  apiFlashCardDelete,
  apiSSMDetail,
  apiSSMFlashcards,
  apiSSMFlashcardUpdate,
} from '../../lookup';
import { StudyElement } from './study';
import { getAnkiInterval } from './algorithm'
import { Button, ButtonGroup } from 'react-bootstrap';
import { errorHandler } from '../../utils';

export function StudyComponent(props) {
  const {studySessionManagerId} = props;

  // Get flashcards to study from API
  const [flashcards, setFlashcards] = useState(null);
  const [flashcardsDidSet, setFlashcardsDidSet] = useState(false);

  const [SSM, setSSM] = useState(null);
  const [SSMDidSet, setSSMDidSet] = useState(false);
 
  // Keep track of what flashcard the user is seeing
  const [currentCard, setCurrentCard] = useState(null);
  const [currentCardDidSet, setCurrentCardDidSet] = useState(false);
  const [previousCard, setPreviousCard] = useState(null);

  // Other states
  const [showAnswer, setShowAnswer] = useState(false);
  const [finishedStudying, setFinishedStudying] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState({});
  
  // Get the flashcards to study from the SSM
  useEffect(() => {
    if (flashcardsDidSet === false) {
      setFlashcardsDidSet(true);
      apiSSMFlashcards(studySessionManagerId, (response, status) => {
        if (status === 200) {
          setFlashcards(response);
        } else if (status === 404) {
          setNotFound(true);
        } else {
          // Error getting flashcards from SSM
          errorHandler(response, status, 5001);
        }
      });
    }
  }, [flashcards, flashcardsDidSet, studySessionManagerId]);

  // Get SSM metadata
  useEffect(() => {
    if (SSMDidSet === false) {
      apiSSMDetail(studySessionManagerId, (response, status) => {
        if (status === 200) {
          setSSM(response);
          setSSMDidSet(true);
        } else if (status === 404) {
          setNotFound(true);
        } else {
          // Error getting SSM
          errorHandler(response, status, 5000);
        }
      });
    }
  }, [SSM, SSMDidSet, studySessionManagerId])

  // Get which card should appear
  useEffect(() => {
    if (flashcards && currentCardDidSet === false) {
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
        let card = {id: -1};
        do {
          card = unseenCards[Math.floor(Math.random() * unseenCards.length)];
        } while (previousCard ? (card.id === previousCard.id) : false);
        setCurrentCard(card);
      } else {
        console.log('Looking for seen card')
        // Get earliest card that has already been seen, and is not the previous card
        let earliestFlashcard = {next_review: new Date(100000000000000).toISOString()};
        let flashcard;
        for (flashcard of flashcards) {
          if (flashcard.next_review < earliestFlashcard.next_review &&
              flashcard.learning_status.toUpperCase() !== 'UNSEEN' &&
              (!previousCard || flashcard.id !== previousCard.id)
              ) {
                earliestFlashcard = flashcard;
              }
            }
        setCurrentCard(earliestFlashcard);
      }
      setShowAnswer(false);
      setCurrentCardDidSet(true);
    }
  }, [currentCardDidSet, flashcards, previousCard, flashcardsDidSet]);

  // Shows answer when spacebar is pressed or "Show Answer" is clicked
  const showAnswerHandler = (event) => {
    event.preventDefault();
    setShowAnswer(true);
  }

  // Inform backend of grade
  const backendGradeUpdate = (grade) => {
    if (grade > 4) {
      return;
    }
    setPreviousCard(currentCard);
    setCurrentCardDidSet(false);

    // Calculate when the card should be next seen
    const wasLeech = currentCard.is_leech;
    const {nextReviewDate, interval, easeFactor, isMinute, learningStatus, stepsIndex, leechIndex, isLeech}
      = getAnkiInterval(currentCard, grade, SSM.scheduling_algorithm, SSM.difficulty);

    if (interval !== -1) {
      // Update date in SSM
      apiSSMFlashcardUpdate(
        studySessionManagerId,
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
        (response, status) => {
          if (status === 200) {
            // setCurrentCardDidSet(true);
          } else {
            // Error updating flashcard with information returned from studying
            errorHandler(response, status, 5002);
          }
      });
      // Update date locally
      var flashcardsCopy = flashcards;
      const index = flashcardsCopy.map(e => e.id).indexOf(currentCard.id);

      if ((isMinute ? interval : interval*60*24) > SSM.review_ahead_minutes) {
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
      document.activeElement.blur();
    } else if (isNaN(event.key) === false && showAnswer) {
      // Shortcuts for clicking 'Again', 'Hard', ...
      let grade = parseInt(event.key);

      const learningStatus = currentCard.learning_status.toLowerCase();
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
        document.getElementById('showanswer').focus();
      } catch (e) { // happens when we are finished studiyng
        // pass
      }
    }
  }

  // Callback for when the user presses delete flashcard
  const flashcardDeleteCallback = (event) => {
    event.preventDefault();
    apiFlashCardDelete(currentCard.parent_deck_id, currentCard.creator_id, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        // Error deleting flashcard while studying
        errorHandler(response, status, 2008);
      }
    });
  }

  // Creates a function for marking the flashcard as suspended/leeched
  const flashcardLeechSuspendGenerator = (action) => {
    return (event) => {
      event.preventDefault();
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
  
  if (notFound) {
    return <p className='text-center'>Couldn't find this deck</p>
  } else if (SSM === null) {
    return <p className='text-center'>Loading...</p>
  }

  return (
    <>
      {finishedStudying ?
        <div className='text-center'>
          <p>Congratulations! You've finished studying these flashcards!</p>
          <ButtonGroup>
            <Button href='/home/decks/'>Decks Home</Button>
          </ButtonGroup>
          {SSM.deck_id &&
            <Button href={`/decks/${SSM.deck_id}/flashcards/create/`}>Create a new flashcard</Button>
          }
        </div>
        :
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
          />
        </div>
      }
    </>
  );
}