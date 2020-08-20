import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiFlashCardDateUpdate} from '../lookup';
import {StudyElement} from './study';
import {getInterval} from './algorithm'
import {Button} from 'react-bootstrap';

export function StudyComponent(props) {
  const {deckId, flashcardList} = props;
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
      // Only get cards that were due previously
      const toReview = deck.flashcards.filter((card) => {
        const now = new Date();
        const review = new Date(card.next_review);
        // This is done weirdly so that you don't have to wait for 1min/10min cards
        return new Date(review.getFullYear(), review.getMonth(), review.getDate()) < now && card.is_suspended === false;
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
  }, [currentCardDidSet, setCurrentCardDidSet, deck]);

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
    const {nextReviewDate, interval, ease, minute, graduated} = getInterval(currentCard, grade);

    // Update date in database
    apiFlashCardDateUpdate(deckId, currentCard.id, nextReviewDate.toISOString(), minute ? 0 : interval, ease, graduated, () => {
      setCurrentCardDidSet(true);
    });

    // Update date locally
    const deckCopy = deck;
    const index = deckCopy.flashcards.map(e => e.id).indexOf(currentCard.id);
    deckCopy.flashcards[index].next_review = nextReviewDate.toISOString();
    deckCopy.flashcards[index].interval = minute ? 0 : interval;
    deckCopy.flashcards[index].ease = ease;
    deckCopy.flashcards[index].graduated = graduated;
    setDeck(deckCopy);
  };

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      // Show answer when spacebar is pressed
      setShowAnswer(true);
    } else if (isNaN(event.key) === false && showAnswer) {
      // Shortcuts for clicking 'Again', 'Hard', ...
      backendGradeUpdate(Number(event.key));
    };
  };

  return (
    <div>
      <div className={'text-center' + (finishedStudying ? '' : ' d-none')}>
        <p>Congratulations! You've finished studying this deck!</p>
        {flashcardList ? null :
          <Button href={`/${deckId}/flashcards/create/`}>Create a new flash card</Button>
        }
      </div>
      <div>
        {finishedStudying ? null :
          <StudyElement
            currentCard={currentCard}
            showAnswer={showAnswer}
            showAnswerHandler={showAnswerHandler}
            backendGradeUpdate={backendGradeUpdate}
            handleKeyDown={handleKeyDown}
          />
        }
      </div>
    </div>
  );
};
