import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiFlashCardReviewUpdate, apiFlashCardSearch, apiFlashCardSuspendLeech, apiFlashCardDelete, apiDeckFlashcards} from '../../lookup';
import {StudyElement} from './study';
import {getAnkiInterval} from './algorithm'
import {Button} from 'react-bootstrap';
import { errorHandler } from '../../utils';

export function StudyComponent(props) {
  const {deckId, flashcardList, studySuspendedCards} = props;
  const reviewAheadMinutes = props.reviewAheadMinutes ? parseInt(props.reviewAheadMinutes) : 120;
  // Either specify `deckId`, the ID of the deck to study
  // or `flashcardList`, a raw list of flashcards
  // Do NOT specify both

  // Get deck to study from API
  const [deck, setDeck] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [deckDidSet, setDeckDidSet] = useState(false);
  
  const [currentCard, setCurrentCard] = useState(null);
  const [currentCardDidSet, setCurrentCardDidSet] = useState(false);
  const [previousCard, setPreviousCard] = useState(null);
  
  const [showAnswer, setShowAnswer] = useState(false);
  const [finishedStudying, setFinishedStudying] = useState(false);

  const [canceledBtns, setCanceledBtns] = useState([]);
  const [message, setMessage] = useState({});
  
  // Get flashcard list (either from raw list, `flashcardList` or
  // indirectly from sending an API call)
  useEffect(() => {
    if (deckDidSet === false) {
      if (!flashcardList) {
        // If `deckId` is specified (and `flashcardList` isn't) then
        // get the list of flashcards from the API
        setDeckDidSet(true);
        apiDeckDetail(deckId, (response, status) => {
          if (status === 200) {
            setDeck(response);
          } else if (status === 403) {
            window.location.href = `/decks/${deckId}`;
          } else {
            // Error getting deck to study
            errorHandler(response, status, 1009);
          };
        });
        apiDeckFlashcards(deckId, null, (response, status) => {
          if (status === 200) {
            setFlashcards(response);
          } else if (status === 403) {
            window.location.href = `/decks/${deckId}`;
          } else {
            // Error getting deck's flashcards to study
            errorHandler(response, status, 1017);
          };
        });
      } else {
        // Get deck from raw list of flashcards
        // TODO: fix this, why on earth is the deck being set to a flashcards list????
        setDeckDidSet(true);
        setDeck(flashcardList);
      };
    };
  }, [deckId, flashcardList, deckDidSet, flashcards]);

  // Get which card should appear
  useEffect(() => {
    if (deck && flashcards && currentCardDidSet === false) {
      setCurrentCardDidSet(true);
      // Only get cards that were due previously (or if we are studying ahead)
      const cardsDueNow = flashcards.filter((card) => {
        let now = new Date();
        // If we are reviewing ahead, change when "now" is
        now.setMinutes(now.getMinutes() + reviewAheadMinutes);

        // Date the card should be reviewed
        const review = new Date(card.next_review);

        // If the card is unseen, and we have surpassed the new cards limit
        // do not show the card
        if (card.learning_status === 'UNSEEN' && deck.new_cards_done_today >= deck.daily_new_card_limit) {
          return false;
        };

        return review < now && (!card.is_suspended || studySuspendedCards);
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
  }, [currentCardDidSet, setCurrentCardDidSet, deck, studySuspendedCards, reviewAheadMinutes, previousCard, flashcards]);

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
    const wasLeech = currentCard.is_leech;
    const {nextReviewDate, interval, easeFactor, isMinute, learningStatus, stepsIndex, leechIndex, isLeech} = getAnkiInterval(currentCard, grade, deck.scheduling_algorithm);

    // This checks that the interval is valid
    if (interval !== -1) {
      // Update date in database
      apiFlashCardReviewUpdate(
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
      const flashcardsCopy = flashcards, deckCopy = deck;
      const index = flashcardsCopy.map(e => e.id).indexOf(currentCard.id);
      if (flashcardsCopy[index].learning_status === 'UNSEEN') {deckCopy.new_cards_done_today++};
      flashcardsCopy[index].next_review = nextReviewDate.toISOString();
      flashcardsCopy[index].interval = isMinute ? 0 : interval;
      flashcardsCopy[index].ease = easeFactor;
      flashcardsCopy[index].learning_status = learningStatus;
      flashcardsCopy[index].steps_index = stepsIndex;
      setFlashcards(flashcardsCopy);
      setDeck(deckCopy);

      // Display a message if the card is now a leech
      if (!wasLeech && isLeech) {
        setMessage({
          variant: 'danger',
          content: 'Flashcard automatically marked as a leech',
        });
        setTimeout(() => setMessage({}), 5000);
      };
    };
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      // Show answer when spacebar is pressed
      setShowAnswer(true);

      // Unselect everything
      document.activeElement.blur();
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
      // Select the 'Show Answer' button
      try {
        document.getElementById('showanswer').focus();
      } catch (e) {
        // pass
      };
    };
  };

  const flashcardDeleteCallback = (event) => {
    event.preventDefault();
    apiFlashCardDelete(currentCard.parent_deck_id, currentCard.id, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        // Error deleting flashcard while studying
        errorHandler(response, status, 2008);
      };
    });
  };

  const flashcardLeechSuspendGenerator = (action) => {
    return (event) => {
      event.preventDefault();
      apiFlashCardSuspendLeech(currentCard.parent_deck_id, currentCard.id, action, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error marking flashcard as leech or suspending while studying
          errorHandler(response, status, 2002);
        };
      });
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
            message={message}
            showAnswerHandler={showAnswerHandler}
            backendGradeUpdate={backendGradeUpdate}
            handleKeyDown={handleKeyDown}
            getCanceledBtns={setCanceledBtns}
            deleteFlashCardHandler={flashcardDeleteCallback}
            leechsuspendFlashCardGenerator={flashcardLeechSuspendGenerator}
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
  const {deckIds, tags, contains, suspended, leech, learningStatus, minEase, maxEase} = props;
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
        minEase && minEase !== 'None' ? parseInt(minEase) : null,
        maxEase && maxEase !== 'None' ? parseInt(maxEase) : null,
        (response, status) => {
          if (status === 200) {
            setFlashcards(response);
          } else {
            // Error searching for flashcards in custom study
            errorHandler(response, status, 2007);
          };
      });
    };
  }, [setFlashcards, gotFlashcards, setGotFlashcards, deckIds, tags, contains, suspended, leech, learningStatus, minEase, maxEase]);

  if (flashcards === null || flashcards.length === 0) {
    return null;
  } else {
    return (
      <StudyComponent
        flashcardList={{flashcards: flashcards}}
        // studySuspendedCards={true}
        // reviewAheadMinutes={1}
      />
    );
  };
};