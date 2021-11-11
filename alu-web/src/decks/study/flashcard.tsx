import BrowserInteractionTime from 'browser-interaction-time';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { ReviewInstance } from '../types';
import { StudyAnswerDispatch } from './context';
import { apiReviewInstanceUpdate } from '../../lookup/lookup';
import { processFront, processBack } from './process-text';
import { getStudyInterval } from './algorithm';
import { getMinNum } from './utils';
import { range, RenderRichText } from '../../utils';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './flashcard.scss';

interface ReviewInstanceStudyProps {
  reviewInstance: ReviewInstance;
  deckId: number;
  section: string;
  studyAhead: boolean;
}
export function ReviewInstanceStudy({ reviewInstance, deckId, section, studyAhead }: ReviewInstanceStudyProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const studyAnswerDispatch = useContext(StudyAnswerDispatch);
  const intervals = useMemo(
    () => range(0, 4).map(i => getStudyInterval(reviewInstance, (i + 1) as 1 | 2 | 3 | 4)),
    [reviewInstance],
  );
  const browserInteractionTime = useMemo(() => {
    const timer = new BrowserInteractionTime({
      idleTimeoutMs: 30000,
    });
    timer.startTimer();

    return timer;
  }, []);


  const studyFlashcard = useCallback((grade: 1 | 2 | 3 | 4) => {
    if (!studyAnswerDispatch) return () => {};

    return async () => {
      if (!isFlipped) return;
      let interval = intervals[grade - 1];

      // Flip back to front and update server review instance
      setIsFlipped(false);

      if (!studyAhead) // studying ahead doesn't update RIs
        apiReviewInstanceUpdate(
          deckId,
          reviewInstance.id,
          browserInteractionTime.getTimeInMilliseconds(),
          ['AGAIN', 'HARD', 'GOOD', 'EASY'][grade - 1] as 'AGAIN' | 'HARD' | 'GOOD' | 'EASY',
          interval,
          section,
        );

      // Wait until the back of the card is no longer shown (half of transition = 0.25s),
      // then show the next card
      await new Promise(r => setTimeout(r, 125));
      studyAnswerDispatch({
        action: 'STUDY_REVIEW_INSTANCE',
        reviewInstance: reviewInstance,
        interval: interval,
        id: reviewInstance.id,
      });
      (document.activeElement as HTMLElement).blur();
      browserInteractionTime.reset();
      browserInteractionTime.startTimer();
    }
  }, [reviewInstance, studyAnswerDispatch, intervals, isFlipped, browserInteractionTime, deckId, section, studyAhead]);

  // Events on keypresses (flipping with space, grading with 1-4)
  useEffect(() => {
    const keyUp = event => {
      switch (event.key) {
        case ' ':
          setIsFlipped(!isFlipped);
          break;
        case '1': case '2': case '3': case '4':
          if (!isFlipped) return;
          // Convert the `rawGrade` into an actual number, because
          // sometimes buttons are missing as their grade is invalid,
          // but the user still enters that number
          const rawGrade = parseInt(event.code.substr(-1));
          const grade = (intervals.map(
            (interval, i) => ({ i: i, interval: interval})
          ).filter(
            interval_i => getMinNum(interval_i.interval) > 0
          ).map(
            interval_i => interval_i.i
          )[rawGrade - 1] + 1) as 1 | 2 | 3 | 4;
          if (!grade) return;

          studyFlashcard(grade)();
          break;
        default:
          break;
      }
    }
    document.addEventListener('keyup', keyUp);
    return () => document.removeEventListener('keyup', keyUp);
  }, [isFlipped, studyFlashcard, intervals]);

  // Position stuff to act like `position: absolute`
  useEffect(() => {
    const frontSide = document.querySelector('div.flashcard.front') as HTMLElement;
    const backSide = document.querySelector('div.flashcard.back') as HTMLElement;
    const frontSideHeight = window.getComputedStyle(frontSide).height;
    const backSideHeight = window.getComputedStyle(backSide).height;

    // Move back of the flashcard to be the same height as the front
    if (isFlipped)
      backSide.style.transform = `rotateY(0deg) translateY(-${frontSideHeight})`;
    else
      backSide.style.transform = `rotateY(-180deg) translateY(-${frontSideHeight})`;
    
    // Make sure the surrounding div has the correct height
    const flashcardFlip = document.querySelector('.flashcard-flip') as HTMLElement;
    flashcardFlip.style.height = `${Math.max(parseInt(frontSideHeight), parseInt(backSideHeight))}px`;
  });

  return (
    <div style={{ maxHeight: '70vh' }}>
      <div
        className={'flashcard-flip' + (isFlipped ? ' is-flipped' : '')}
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ maxHeight: '70vh' }}
      >
        <div className='flashcard front'>
          {
            reviewInstance.data?.fields &&
            processFront(reviewInstance).length > 0 &&
            <div className='text'>
              <RenderRichText
                text={processFront(reviewInstance)}
                fixSlateLazy
              />
            </div>
          }
          {reviewInstance.data?.images[reviewInstance.content_indicies[0]]?.image && <div className='image'>
            <img
              src={reviewInstance.data?.images[reviewInstance.content_indicies[0]]?.image}
              alt='Flashcard attached front'
              className='flashcard-image'
            />
          </div>}
        </div>
        <div className='flashcard back'>
          {
            reviewInstance.data?.fields &&
            processBack(reviewInstance).length > 0 &&
            <div className='text'>
              <RenderRichText
                text={processBack(reviewInstance)}
                fixSlateLazy
              />
            </div>
          }
          {reviewInstance.data?.images[reviewInstance.content_indicies[1]]?.image && <div className='image'>
            <img
              src={reviewInstance.data?.images[reviewInstance.content_indicies[1]]?.image}
              alt='Flashcard attached back'
              className='flashcard-image'
            />
          </div>}
        </div>
      </div>
      <div className='other-study-els text-secondary text-center mb-1' id='study-flip-text'>
        <small>Tap the card or press space to reveal the other side</small>
      </div>
      <div className={'other-study-els answer-choices' + (isFlipped ? ' is-flipped' : '')}>
        <ButtonGroup className='w-100'>
          {['Again', 'Hard', 'Good', 'Easy'].map((difficulty, i) =>
            <Button
              onClick={studyFlashcard((i + 1) as 1 | 2 | 3 | 4)}
              className={'other-study-els mr-1 mt-5' + (getMinNum(intervals[i]) < 0 ? ' d-none': '')}
              variant={['danger', 'warning', 'success', 'primary'][i]}
              style={isFlipped ? {} : { cursor: 'default' }}
              key={i}
            >
              {difficulty} {
                getMinNum(intervals[i]) >= 1440
                  ? `${Math.floor(getMinNum(intervals[i])/1440)}d`
                  : `${Math.floor(getMinNum(intervals[i]))}m`
              }
            </Button>
          )}
        </ButtonGroup>
        <div className='other-study-els text-secondary text-center'>
          <small>
            Tap a button or use the number keys 1-{intervals.filter(timing => getMinNum(timing) > 0).length}
            {' '}to rate how well you remembered the flashcard
          </small>
        </div>
      </div>
    </div>
  );
}
