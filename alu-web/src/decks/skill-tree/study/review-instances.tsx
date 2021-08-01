import React, { useMemo } from 'react';
import { ReviewInstance } from '../../types';
import { ReviewInstanceStudy } from './flashcard';
import Container from 'react-bootstrap/Container';
import './review-instances.scss';

const EASE_FOR_HARD_EXERCISE = 210;  // TODO: update with real data
export function StudyReviewInstances(props: { reviewInstances: ReviewInstance[] }) {
  const { reviewInstances } = props;
  const originalNumReviewInstances = useMemo(
    () => reviewInstances.length,
    // eslint-disable-next-line
    [],
  );

  return (
    <Container>
      <div>
        <div className='study-progress mt-3'>
          <div
            className='study-progress-bar'
            style={{ width: `${Math.floor((1 - reviewInstances.length/originalNumReviewInstances) * 100)}%` }}
          />
        </div>
        <p className={
          'hard-exercise-text my-2' +
          (reviewInstances[0].ease <= EASE_FOR_HARD_EXERCISE ? ' show' : '')
        }>
          This flashcard is tough!  Good luck!
        </p>
      </div>
      <ReviewInstanceStudy reviewInstance={reviewInstances[0]} />
    </Container>
  );
}