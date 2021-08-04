import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import BrowserInteractionTime from 'browser-interaction-time';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { apiReviewInstanceUpdate } from '../../../lookup/lookup';
import { range, RenderRichText } from '../../../utils';
import { getAnkiInterval } from '../../study/algorithm';
import { ReviewInstance } from '../../types';
import { StudyAnswerDispatch } from './context';
import './flashcard.scss';
import { getMinNum } from './utils';

export function ReviewInstanceStudy(props: { reviewInstance: ReviewInstance }) {
  const { reviewInstance } = props;
  const [isFlipped, setIsFlipped] = useState(false);
  const studyAnswerDispatch = useContext(StudyAnswerDispatch);
  const intervals = useMemo(
    () => range(0, 4).map(i => getAnkiInterval(reviewInstance, (i + 1) as 1 | 2 | 3 | 4)),
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
      apiReviewInstanceUpdate(
        reviewInstance.id,
        browserInteractionTime.getTimeInMilliseconds(),
        ['AGAIN', 'HARD', 'GOOD', 'EASY'][grade - 1] as 'AGAIN' | 'HARD' | 'GOOD' | 'EASY',
        interval,
      );

      // Wait until the back of the card is no longer shown (half of transition = 0.25s)<
      // then show the next card
      await new Promise(r => setTimeout(r, 125));
      studyAnswerDispatch({
        action: 'STUDY_REVIEW_INSTANCE',
        interval: interval,
        id: reviewInstance.id,
      });
      (document.activeElement as HTMLElement).blur();
      browserInteractionTime.reset();
      browserInteractionTime.startTimer();
    }
  }, [reviewInstance.id, studyAnswerDispatch, intervals, isFlipped, browserInteractionTime]);

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

  return (
    <div>
      <div
        className={'flip' + (isFlipped ? ' is-flipped' : '')}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className='card front'>
          <RenderRichText
            text={reviewInstance.flashcard_fields ? reviewInstance.flashcard_fields[0] : []}
            fixSlateLazy
          />
        </div>
        <div className='card back'>
          <RenderRichText
            text={reviewInstance.flashcard_fields ? reviewInstance.flashcard_fields[1] : []}
            fixSlateLazy
          />
        </div>
      </div>
      <div className='text-secondary text-center mb-1'>
        <small>Tap the card or press space to reveal the other side</small>
      </div>
      <div className={'answer-choices' + (isFlipped ? ' is-flipped' : '')}>
        <ButtonGroup className='w-100'>
          {['Again', 'Hard', 'Good', 'Easy'].map((difficulty, i) =>
            <Button
              onClick={studyFlashcard((i + 1) as 1 | 2 | 3 | 4)}
              className={'mr-1' + (getMinNum(intervals[i]) < 0 ? ' d-none': '')}
              variant={['danger', 'warning', 'success', 'primary'][i]}
              style={isFlipped ? {} : { cursor: 'default' }}
              key={i}
            >
              {difficulty} {
                getMinNum(intervals[i]) > 1440 ? `${Math.floor(getMinNum(intervals[i])/1440)}d`
                :
                `${Math.floor(getMinNum(intervals[i]))}m`
              }
            </Button>
          )}
        </ButtonGroup>
        <div className='text-secondary text-center mb-5'>
          <small>
            Tap a button or use the number keys 1-{intervals.filter(timing => getMinNum(timing) > 0).length}
            {' '}to rate how well you remembered the flashcard
          </small>
        </div>
      </div>
    </div>
  );
}
