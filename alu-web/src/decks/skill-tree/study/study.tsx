import React from 'react';
import { apiReviewInstanceStudy, useAsyncDispatch } from '../../../lookup/lookup';
import { ReviewInstance } from '../../types';
import { StudyReviewInstances } from './review-instances';
import { StudyAnswerDispatch, StudyAnswerEvent, studyAnswerReducer } from './context';


export function StudySkillTree({ deckId, tags='' }: { deckId: string, tags: string }) {
  const [reviewInstances, dispatchReviewInstances] = useAsyncDispatch<
    ReviewInstance[], StudyAnswerEvent
  >(
    apiReviewInstanceStudy,
    [parseInt(deckId), tags.replace('-', ' ').replace('__', ' AND ')],
    studyAnswerReducer,
  );

  if (!reviewInstances)
    return <p className='text-center mt-5'>Loading...</p>

  return (
    <StudyAnswerDispatch.Provider value={dispatchReviewInstances}>
      <StudyReviewInstances
        reviewInstances={reviewInstances}
        deckId={parseInt(deckId)}
      />
    </StudyAnswerDispatch.Provider>
  );
}
