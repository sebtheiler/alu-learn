import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiFlashCardDateUpdate, apiFlashCardSearch} from '../../lookup';
import {StudyElement} from './study';
import {getAnkiInterval} from './algorithm'
import {Button} from 'react-bootstrap';
import { errorHandler } from '../../utils';

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
  const [previousCard, setPreviousCard] = useState(null);
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [finishedStudying, setFinishedStudying] = useState(false);

  const [canceledBtns, setCanceledBtns] = useState([]);
  
  // Get flashcard list (either from raw list, `flashcardList` or
  // indirectly from sending an API call)
  useEffect(() => {
    if (gotDeck === false) {
      if (!flashcardList) {
        // If `deckId` is specified (and `flashcardList` isn't) then
        // get the list of flashcards from the API
        setGotDeck(true);
        apiDeckDetail(deckId, (response, status) => {
          if (status === 200) {
            setDeck(response);
          } else {
            // Error getting deck to study
            errorHandler(response, status, 1009);
          };
        });
      } else {
        // Get deck from raw list of flashcards
        setGotDeck(true);
        setDeck(flashcardList);
      };
    };
  }, [deckId, flashcardList, gotDeck, setGotDeck, deck, setDeck]);

  // Get which card should appear
  useEffect(() => {
    if (deck && currentCardDidSet === false) {
      setCurrentCardDidSet(true);
      // Only get cards that were due previously (or if we are studying ahead)
      const cardsDueNow = deck.flashcards.filter((card) => {
        let now = new Date();
        // If we are reviewing ahead, change when "now" is
        now.setDate(now.getDate() + futureReviewDays);

        // Date the card should be reviewed
        const review = new Date(card.next_review);

        // If the card is unseen, and we have surpassed the new cards limit
        // do not show the card
        if (card.learning_status === 'UNSEEN' && deck.new_cards_done_today >= deck.daily_new_card_limit) {
          return false;
        };

        // This is done weirdly so that you don't have to wait for 1min/10min cards
        // TODO: change to just allow for futureReviewDays to be minutes
        return new Date(review.getFullYear(), review.getMonth(), review.getDate()) < now && (!card.is_suspended || studySuspendedCards);
      });

      // If there are no more cards, we've finished
      if (cardsDueNow.length === 0) {
        setFinishedStudying(true);
        return;
      };

      const toReview = cardsDueNow.length > 1 && previousCard ?
        cardsDueNow.filter(card => card.id !== previousCard.id) :
        cardsDueNow;

      // Sort cards in order of due date
      const sortedCards = toReview.sort((a, b) => {
        return new Date(a.next_review) - new Date(b.next_review);
      });

      // If there are multiple cards that have the same due date, pick randomly from them
      var card;
      if (deck.shuffle_unseen_cards && sortedCards.length > 2) {
        const earliestCards = sortedCards.filter(card => {
          let earliestReview = new Date(sortedCards[0].next_review);
          let nextReview = new Date(card.next_review);

          // Miliseconds may vary based on how the card was created
          // which is why we don't check that they are equal
          return (
            earliestReview.getFullYear() === nextReview.getFullYear() &&
            earliestReview.getMonth() === nextReview.getMonth() &&
            earliestReview.getDate() === nextReview.getDate() &&
            earliestReview.getMinutes() === nextReview.getMinutes() &&
            earliestReview.getSeconds() === nextReview.getSeconds()
          );
        });
        card = earliestCards[Math.floor(Math.random() * earliestCards.length)];
      } else {
        card = sortedCards[0];
      };
      

      // Set current card to studying card
      setCurrentCard(card);
      setShowAnswer(false);
    };
  }, [currentCardDidSet, setCurrentCardDidSet, deck, studySuspendedCards, futureReviewDays, previousCard]);

  // Shows answer when spacebar is pressed or "Show Answer" is clicked
  const showAnswerHandler = (event) => {
    event.preventDefault();
    setShowAnswer(true);
  };

  // Inform backend of grade
  const backendGradeUpdate = (grade) => {
    if (grade > 4) {
      return;
    };
    setPreviousCard(currentCard);
    setCurrentCardDidSet(false);

    // Calculate when the card should be next seen
    const {nextReviewDate, interval, easeFactor, isMinute, learningStatus, stepsIndex, leechIndex, isLeech} = getAnkiInterval(currentCard, grade, deck.scheduling_algorithm);

    // This checks that the interval is valid
    if (interval !== -1) {
      // Update date in database
      apiFlashCardDateUpdate(
        currentCard.parent_deck_id,
        currentCard.id,
        nextReviewDate.toISOString(),
        isMinute ? 0 : interval,
        easeFactor,
        learningStatus,
        stepsIndex,
        leechIndex,
        isLeech,
        currentCard.learning_status === 'UNSEEN', // incrementNewCardsDoneToday
        (response, status) => {
          if (status === 200) {
            setCurrentCardDidSet(true);
          } else {
            // Error updating flashcard with information returned from studying
            errorHandler(response, status, 2006);
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
        // If we are first learning the card
        // and the Hard button is obscured...
        if (grade === 2) {
          grade = 3;
        } else if (grade === 3) {
          grade = 4;
        } else if (grade > 3) {
          return;
        };
      } else if (canceledBtns.toString() === 'Hard,Easy') {
        // If we are relearning the card and the Hard
        // and Easy buttons are obscured...
        if (grade === 2) {
          grade = 3;
        } else if (grade > 2) {
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
            <Button href={`/decks/${deckId}/flashcards/create/`}>Create a new flashcard</Button>
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
            schedulingAlgorithm={deck ? deck.scheduling_algorithm : null}
          />
        </div>
      }
    </>
  );
};

// Instead of taking in a specific deck id, this component takes in a number of
// attributes, searches for all flashcards with those attributes and studies those
// cards.
export function CustomStudyComponent(props) {
  // TODO: make snake_casing and camelCasing consistent
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
            // Error searching for flashcards in custom study
            errorHandler(response, status, 2007);
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