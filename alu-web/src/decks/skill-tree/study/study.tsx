import React from 'react';
import { apiReviewInstanceStudy, useAsyncDispatch } from '../../../lookup/lookup';
import { ReviewInstance } from '../../types';
import { StudyReviewInstances } from './review-instances';
import { StudyAnswerDispatch, StudyAnswerEvent, studyAnswerReducer } from './context';
import { uncleanTag } from '../sub-section';


export default function StudySkillTree({ deckId, section }: { deckId: string, section: string }) {
  const [reviewInstances, dispatchReviewInstances] = useAsyncDispatch<
    ReviewInstance[], StudyAnswerEvent
  >(
    apiReviewInstanceStudy,
    [parseInt(deckId), section],
    studyAnswerReducer,
  );

  if (!reviewInstances)
    return <p className='text-center mt-5'>Loading...</p>

  return (
    <StudyAnswerDispatch.Provider value={dispatchReviewInstances}>
      <StudyReviewInstances
        reviewInstances={reviewInstances}
        deckId={parseInt(deckId)}
        section={section}
      />
    </StudyAnswerDispatch.Provider>
  );
}
