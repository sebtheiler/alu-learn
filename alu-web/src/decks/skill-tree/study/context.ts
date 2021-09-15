import { createContext, Dispatch } from 'react';
import { dateDiff } from '../../../utils';
import { Interval } from '../../study/algorithm';
import { ReviewInstance } from '../../types';

export const REVIEW_AHEAD_MINUTES = 120;

export interface ReviewInstanceStudy {
  due_for_review: ReviewInstance[];
  num_total: number;
}

export type StudyAnswerEvent =
  | { action: 'STUDY_REVIEW_INSTANCE'; id: string, interval: Interval }
export const studyAnswerReducer = (
  state: ReviewInstanceStudy | undefined,
  event: StudyAnswerEvent,
): ReviewInstanceStudy | undefined => {
  if (!state) return;
  switch (event.action) {
    case 'STUDY_REVIEW_INSTANCE':
      // `payload`: {id: ID of review instance, grade: Number 1-4 representing the response Again-Easy}
      // Get index of reviewed review instance
      const index = state.due_for_review.map(ri => ri.id).indexOf(event.id);

      // If the interval is greater than review ahead minutes, remove the review instance from rotation
      if (dateDiff(
        event.interval.last_review,
        event.interval.next_review,
        1000*60,
      ) > REVIEW_AHEAD_MINUTES)
        return { ...state, due_for_review: state.due_for_review.filter(ri => ri.id !== event.id) };

      // Make updates to the local review instance
      let newState = state;
      for (const [attr, val] of Object.entries(event.interval))
        if (!['message', 'is_minute'].includes(attr))
          newState.due_for_review[index][attr] = val;
      
      // Sort flashcards by next review, earliest first
      newState.due_for_review = newState.due_for_review.sort((a, b) =>
        new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
      );

      // Don't show same card twice in a row
      if (newState.due_for_review[0].id === event.id && newState.due_for_review.length > 1)
        newState.due_for_review = [
          newState.due_for_review[1],
          newState.due_for_review[0],
          ...newState.due_for_review.slice(2),
        ];

      return { ...newState };  // React is very stupid so you need to clone the array to force re-render
    default:
      return state;
  }
}

export const StudyAnswerDispatch = createContext<Dispatch<StudyAnswerEvent> | undefined>(undefined);
