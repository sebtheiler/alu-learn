import React from 'react';
import { apiReviewInstanceStudy, useAsyncDispatch } from '../../../lookup/lookup';
import { ReviewInstance } from '../../types';
import { StudyReviewInstances } from './review-instances';


export function StudySkillTree(props: { deckId: string }) {
  const { deckId } = props;
  const [reviewInstances] = useAsyncDispatch<ReviewInstance[]>(
    apiReviewInstanceStudy,
    [parseInt(deckId), null],
  );

  if (!reviewInstances)
    return <p className='text-center mt-5'>Loading...</p>

  return (
    <StudyReviewInstances
      reviewInstances={reviewInstances}
    />
  );
}
