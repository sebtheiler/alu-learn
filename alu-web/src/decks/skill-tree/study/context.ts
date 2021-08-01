import { createContext, Dispatch } from 'react';
// import { apiObjectEdit } from '../../../lookup/lookup';
import { Interval } from '../../study/algorithm';
import { ReviewInstance } from '../../types';

const REVIEW_AHEAD_MINUTES = 120;

export type StudyAnswerEvent =
  | { action: 'STUDY_REVIEW_INSTANCE'; id: string, interval: Interval }
export const studyAnswerReducer = (
  state: ReviewInstance[] | undefined,
  event: StudyAnswerEvent,
): ReviewInstance[] | undefined => {
  if (!state) return;
  switch (event.action) {
    case 'STUDY_REVIEW_INSTANCE':
      // `payload`: {id: ID of review instance, grade: Number 1-4 representing the response Again-Easy}
      // Get index of reviewed review instance
      const index = state.map(ri => ri.id).indexOf(event.id);

      // Update review instance on server
      // TODO: re-enable this after finishing testing
      // apiObjectEdit('decks', 'reviewinstance', event.id, interval);

      // If the interval is greater than review ahead minutes, remove the review instance from rotation
      if (
        (event.interval.is_minute ?
          event.interval.interval : event.interval.interval*60*24
        ) > REVIEW_AHEAD_MINUTES
      )
        return state.filter(ri => ri.id !== event.id);

      // Make updates to the local review instance
      let newState = state;
      for (const [attr, val] of Object.entries(event.interval))
        if (!['message', 'is_minute'].includes(attr))
          newState[index][attr] = val;
      
      // Sort flashcards by next review, earliest first
      newState = newState.sort((a, b) =>
        new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
      );

      // Don't show same card twice in a row
      if (newState[0].id === event.id && newState.length > 1)
        newState = [newState[1], newState[0], ...newState.slice(2)];

      return [...newState];  // React is very stupid so you need to clone the array to force re-render
    default:
      return state;
  }
}

export const StudyAnswerDispatch = createContext<Dispatch<StudyAnswerEvent> | undefined>(undefined);
