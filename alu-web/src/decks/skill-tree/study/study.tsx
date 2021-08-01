import React from 'react';
import { apiReviewInstanceStudy, useAsyncDispatch } from '../../../lookup/lookup';
import { ReviewInstance } from '../../types';
import { StudyReviewInstances } from './review-instances';
import { StudyAnswerDispatch, StudyAnswerEvent, studyAnswerReducer } from './context';


export function StudySkillTree(props: { deckId: string }) {
  const { deckId } = props;
  const [reviewInstances, dispatchReviewInstances] = useAsyncDispatch<
    ReviewInstance[], StudyAnswerEvent
  >(
    apiReviewInstanceStudy,
    [parseInt(deckId), null],
    studyAnswerReducer,
  );

  if (!reviewInstances)
    return <p className='text-center mt-5'>Loading...</p>

  return (
    <StudyAnswerDispatch.Provider value={dispatchReviewInstances}>
      <StudyReviewInstances
        reviewInstances={reviewInstances}
      />
    </StudyAnswerDispatch.Provider>
  );
}
