import React, { useMemo } from 'react';
import { ReviewInstance } from '../../types';
import { ReviewInstanceStudy } from './flashcard';
import Container from 'react-bootstrap/Container';
import './review-instances.scss';

export function StudyReviewInstances(props: { reviewInstances: ReviewInstance[] }) {
  const { reviewInstances } = props;
  const originalNumReviewInstances = useMemo(
    () => reviewInstances.length,
    // eslint-disable-next-line
    [],
  );
  const selectedCard = 1;

  return (
    <Container>
      <div className='study-progress my-3'>
        <div
          className='study-progress-bar'
          style={{ width: `${Math.floor((1 - reviewInstances.length/originalNumReviewInstances) * 100)}%` }}
        />
      </div>
      <ReviewInstanceStudy reviewInstance={reviewInstances[selectedCard]} />
    </Container>
  );
}