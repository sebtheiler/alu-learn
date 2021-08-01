import React from 'react';
import { ReviewInstance } from '../../types';
import { ReviewInstanceStudy } from './flashcard';

export function StudyReviewInstances(props: { reviewInstances: ReviewInstance[] }) {
  const { reviewInstances } = props;
  const selectedCard = 1;

  return (
    <ReviewInstanceStudy reviewInstance={reviewInstances[selectedCard]} />
  );
}