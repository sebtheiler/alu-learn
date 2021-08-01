import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { range, RenderRichText } from '../../../utils';
import { getAnkiInterval } from '../../study/algorithm';
import { ReviewInstance } from '../../types';
import { StudyAnswerDispatch } from './context';
import './flashcard.scss';

export function ReviewInstanceStudy(props: { reviewInstance: ReviewInstance }) {
  const { reviewInstance } = props;
  const [isFlipped, setIsFlipped] = useState(false);
  const intervals = useMemo(
    () => range(0, 4).map(i => getAnkiInterval(reviewInstance, (i + 1) as 1 | 2 | 3 | 4)),
    [reviewInstance],
  );
  const studyAnswerDispatch = useContext(StudyAnswerDispatch);

  const studyFlashcard = useCallback((grade: 1 | 2 | 3 | 4) => {
    if (!studyAnswerDispatch) return () => {};

    return async () => {
      // Flip back to front and wait until the back of the card
      // is no longer shown (half of transition = 0.25s)
      setIsFlipped(false);
      await new Promise(r => setTimeout(r, 125));

      studyAnswerDispatch({
        action: 'STUDY_REVIEW_INSTANCE',
        interval: intervals[grade - 1],
        id: reviewInstance.id,
      });
      (document.activeElement as HTMLElement).blur();
    }
  }, [reviewInstance.id, studyAnswerDispatch, intervals]);


  useEffect(() => {
    const keyUp = event => {
      switch (event.code) {
        case 'Space':
          setIsFlipped(!isFlipped);
          break;
        case 'Digit1': case 'Digit2': case 'Digit3': case 'Digit4':
          // Convert the `rawGrade` into an actual number, because
          // sometimes buttons are missing as their grade is invalid,
          // but the user still enters that number
          const rawGrade = parseInt(event.code.substr(-1));
          const grade = (intervals.map(
            (interval, i) => ({ i: i, interval: interval})
          ).filter(
            interval_i => interval_i.interval.interval > 0
          ).map(
            interval_i => interval_i.i
          )[rawGrade - 1] + 1) as 1 | 2 | 3 | 4;
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
      <div className='text-secondary text-center mb-5'>
        <small>Tap the card or press space to reveal the other side</small>
      </div>
      <div className={'answer-choices' + (isFlipped ? ' is-flipped' : '')}>
        <ButtonGroup className='w-100'>
          {['Again', 'Hard', 'Good', 'Easy'].map((difficulty, i) =>
            <Button
              onClick={studyFlashcard((i + 1) as 1 | 2 | 3 | 4)}
              className={'mr-1' + (intervals[i].interval < 0 ? ' d-none': '')}
              variant={['danger', 'warning', 'success', 'primary'][i]}
              key={i}
            >
              {difficulty} {intervals[i].interval.toString() + (intervals[i].is_minute ? 'm' : 'd')}
            </Button>
          )}
        </ButtonGroup>
        <div className='text-secondary text-center mb-5'>
          <small>
            Tap a button or use the number keys 1-{intervals.filter(timing => timing.interval > 0).length}
            {' '}to rate how well you remembered the flashcard
          </small>
        </div>
      </div>
    </div>
  );
}
