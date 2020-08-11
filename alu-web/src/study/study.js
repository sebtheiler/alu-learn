import React, {useState, useEffect} from 'react';
import {apiDeckDetail, apiFlashCardDateUpdate} from '../lookup';


export function StudyComponent(props) {
  const {deckId} = props;
  const [deck, setDeck] = useState(null);
  const [deckDidSet, setDeckDidSet] = useState(false);
  const [cardsToStudy, setCardsToStudy] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finishedStudying, setFinishedStudying] = useState(false);

  // Send call to API to get list of cards to study
  useEffect(() => { // THIS FUNCTION IS TOOOOOOOO SLOW
    if (deckDidSet === false) {
      // TODO: This API call should be removed as it is only reflecting changes
      // that we are making locally
      apiDeckDetail(deckId, (response, status) => {
        if (status === 200) {
          setDeckDidSet(true);
          setDeck(response); // running 3 times
          setShowAnswer(false);
          
          // Only get cards that were due previously
          const toReview = response.flashcards.filter((card) => {
            const now = new Date();
            const review = new Date(card.next_review);
            return new Date(review.getFullYear(), review.getMonth(), review.getDate()) < now;
          });
          setCardsToStudy(toReview);
          
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
        } else {
          alert('Error');
        };
      });
    };
  }, [deckId, deck, setDeck, deckDidSet, setDeckDidSet, cardsToStudy]);

  // Called when spacebar is pressed or "Show Answer" is clicked
  const showAnswerHandler = (event) => {
    event.preventDefault();
    setShowAnswer(true);
  };

  // Inform backend of grade
  const backendIntervalUpdate = (grade) => {
    if (grade > 4) {
      return;
    };
    console.log(grade)
    const now = new Date();
    if (grade > 1) {
      // Tomorrow morning
      var nextReviewDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else {
      // 1 minute from now
      var nextReviewDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, now.getSeconds());
    };
    // Update date in database
    apiFlashCardDateUpdate(deckId, currentCard.id, nextReviewDate.toISOString(), () => {
      setDeckDidSet(false);
    });
  };

  const buttonIntervalWrapper = (grade) => {
    return () => {
      backendIntervalUpdate(grade);
    };
  };

  // Used for handling keypresses
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === ' ') {
        // Show answer when spacebar is pressed
        setShowAnswer(true);
      } else if (isNaN(event.key) === false && showAnswer) {
        // Shortcuts for clicking 'Again', 'Hard', ...
        backendIntervalUpdate(Number(event.key));
      };
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAnswer]);

  return <div>
           <div className={finishedStudying ? '' : 'd-none'}>
             <p className='text-center'>Congratulations! You've finished studying this deck!</p>
           </div>
           <div className={finishedStudying ? 'd-none' : ''}>
            <div className='col-md-12 text-center'style={{minWidth: '200px'}}>
              <p>{currentCard ? currentCard.front_text : null}</p>
            </div>
            <div className='col-md-12 text-center' style={{minWidth: '200px'}}>
                <p>{currentCard && showAnswer ? currentCard.back_text : ''}</p>
            </div>
            <footer className='fixed-bottom'>
              <div className={'col-md-12 text-center btn-group' + (showAnswer ? ' d-none' : '')}>
                <button onClick={showAnswerHandler} className='btn btn-primary'>Show Answer</button>
              </div>
              <div className={'col-md-12 text-center btn-group' + (!showAnswer ? ' d-none' : '')}>
                <button onClick={buttonIntervalWrapper(1)} className='btn btn-primary mx-1'>Again</button>
                <button onClick={buttonIntervalWrapper(2)} className='btn btn-primary mx-1'>Hard</button>
                <button onClick={buttonIntervalWrapper(3)} className='btn btn-primary mx-1'>Good</button>
                <button onClick={buttonIntervalWrapper(4)} className='btn btn-primary mx-1'>Easy</button>
              </div>
            </footer>
           </div>
         </div>
};