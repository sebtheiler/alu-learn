import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiFlashCardDateUpdate, apiFlashCardSearch} from '../../lookup';
import {StudyElement} from './study';
import {getAnkiInterval} from './algorithm'
import {Button} from 'react-bootstrap';

export function StudyComponent(props) {
  const {deckId, flashcardList, studySuspendedCards} = props;
  const futureReviewDays = props.futureReviewDays ? parseInt(props.futureReviewDays) : 0;
  // Either specify `deckId`, the ID of the deck to study
  // or `flashcardList`, a raw list of flashcards
  // Do NOT specify both

  // Get deck to study from API
  const [deck, setDeck] = useState(null);
  const [gotDeck, setGotDeck] = useState(false);
  
  const [currentCard, setCurrentCard] = useState(null);
  const [currentCardDidSet, setCurrentCardDidSet] = useState(false);
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [finishedStudying, setFinishedStudying] = useState(false);

  const [canceledBtns, setCanceledBtns] = useState([]);
  
  useEffect(() => {
    if (gotDeck === false) {
      if (!flashcardList) {
        // Get deck from ID
        setGotDeck(true);
        apiDeckDetail(deckId, (response, status) => {
          if (status === 200) {
            setDeck(response);
          } else {
            alert('Error');
          };
        });
      } else {
        // Get deck from raw list of flashcards
        setGotDeck(true);
        setDeck(flashcardList);
      };
    };
  }, [deckId, flashcardList, gotDeck, setGotDeck, deck, setDeck]);

  useEffect(() => {
    if (deck && currentCardDidSet === false) {
      setCurrentCardDidSet(true);
      // Only get cards that were due previously (or if we are studying ahead)
      const toReview = deck.flashcards.filter((card) => {
        var now = new Date();
        // If we are reviewing ahead, change when "now" is
        now.setDate(now.getDate() + futureReviewDays);

        // Date the card should be reviewed
        const review = new Date(card.next_review);

        // This is done weirdly so that you don't have to wait for 1min/10min cards
        return new Date(review.getFullYear(), review.getMonth(), review.getDate()) < now && (!card.is_suspended || studySuspendedCards);
      });

      // If there are no more cards, we've finished
      if (toReview.length === 0) {
        setFinishedStudying(true);
      };

      // Get which card we should study
      const card = toReview.sort((a, b) => {
        return new Date(a.next_review) - new Date(b.next_review);
      })[0];

      // Set current card to studying card
      setCurrentCard(card);
      setShowAnswer(false);
    };
  }, [currentCardDidSet, setCurrentCardDidSet, deck, studySuspendedCards, futureReviewDays]);

  // Called when spacebar is pressed or "Show Answer" is clicked
  const showAnswerHandler = (event) => {
    event.preventDefault();
    setShowAnswer(true);
  };

  // Inform backend of grade
  const backendGradeUpdate = (grade) => {
    if (grade > 4) {
      return;
    };
    setCurrentCardDidSet(false);

    // Calculate when the card should be next seen
    const {nextReviewDate, interval, easeFactor, isMinute, learningStatus, stepsIndex} = getAnkiInterval(currentCard, grade);

    // This checks that the interval is valid
    if (interval !== -1) {
      // Update date in database
      apiFlashCardDateUpdate(currentCard.parent_deck_id, currentCard.id, nextReviewDate.toISOString(), isMinute ? 0 : interval, easeFactor, learningStatus, stepsIndex, (response, status) => {
        if (status === 200) {
          setCurrentCardDidSet(true);
        } else {
          console.log(response, status);
          alert('Error updating card!');
        };
      });
      // Update date locally
      const deckCopy = deck;
      const index = deckCopy.flashcards.map(e => e.id).indexOf(currentCard.id);
      deckCopy.flashcards[index].next_review = nextReviewDate.toISOString();
      deckCopy.flashcards[index].interval = isMinute ? 0 : interval;
      deckCopy.flashcards[index].ease = easeFactor;
      deckCopy.flashcards[index].learning_status = learningStatus;
      deckCopy.flashcards[index].steps_index = stepsIndex;
      setDeck(deckCopy);
    };
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      // Show answer when spacebar is pressed
      setShowAnswer(true);
    } else if (isNaN(event.key) === false && showAnswer) {
      // Shortcuts for clicking 'Again', 'Hard', ...
      let grade = parseInt(event.key);
      if (canceledBtns.toString() === 'Hard') {
        if (grade === 2) {
          grade = 3;
        } else if (grade === 3) {
          grade = 4;
        } else if (grade > 3) {
          return;
        };
      } else if (canceledBtns.toString() === 'Good,Easy') {
        if (grade > 2) {
          return;
        };
      };
      backendGradeUpdate(grade);
    };
  };

  return (
    <>
      {finishedStudying ?
        <div className='text-center'>
          <p>Congratulations! You've finished studying this deck!</p>
          {flashcardList ? null :
            <Button href={`/${deckId}/flashcards/create/`}>Create a new flash card</Button>
          }
        </div>
        :
        <div>
          <StudyElement
            currentCard={currentCard}
            showAnswer={showAnswer}
            showAnswerHandler={showAnswerHandler}
            backendGradeUpdate={backendGradeUpdate}
            handleKeyDown={handleKeyDown}
            getCanceledBtns={setCanceledBtns}
          />
        </div>
      }
    </>
  );
};

export function CustomStudyComponent(props) {
  const {deckIds, tags, contains, suspended, leech, learningStatus, min_ease, max_ease} = props;
  const [flashcards, setFlashcards] = useState([]);
  const [gotFlashcards, setGotFlashcards] = useState(false);

  useEffect(() => {
    if (gotFlashcards === false) {
      // Handle props data and send request to API
      apiFlashCardSearch(
        deckIds && deckIds !== 'None' ? deckIds.split(',').map(id => parseInt(id)) : null,
        tags && tags !== 'None' ? tags.split(',') : null,
        contains && contains !== 'None' ? contains : null,
        suspended && suspended !== 'None' ? suspended === 'true' : null,
        leech && leech !== 'None' ? leech === 'true' : null,
        learningStatus && learningStatus !== 'None' ? learningStatus === 'true' : null,
        min_ease && min_ease !== 'None' ? parseInt(min_ease) : null,
        max_ease && max_ease !== 'None' ? parseInt(max_ease) : null,
        (response, status) => {
          if (status === 200) {
            setFlashcards(response);
          } else {
            console.log(response, status);
            alert('Error in custom study!');
          };
      });
    };
  }, [setFlashcards, gotFlashcards, setGotFlashcards, deckIds, tags, contains, suspended, leech, learningStatus, min_ease, max_ease]);

  if (flashcards.length === 0) {
    return null;
  } else {
    return (
      <StudyComponent
        flashcardList={{flashcards: flashcards}}
        // studySuspendedCards={true}
        // futureReviewDays={1}
      />
    );
  };
};