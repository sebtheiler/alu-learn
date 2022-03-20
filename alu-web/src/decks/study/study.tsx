import { Deck } from '../types';
import { ReviewInstanceStudy, StudyAnswerDispatch, StudyAnswerEvent, studyAnswerReducer } from './context';
import { StudyReviewInstances } from './review-instances';
import { apiReviewInstanceStudy, backendFetch, useAsyncDispatch, useAsyncState } from '../../lookup/lookup';
import { useMemo } from 'react';


interface StudySkillTreeProps {
  deckId: string;
  section: string;
  isPro: 'true' | 'false';

  assignmentId: never;
}
interface StudyAssignmentProps {
  assignmentId: string;
  isPro: 'true' | 'false';

  deckId: never;
  section: never;
}

export default function Study({ deckId, section, assignmentId, isPro }: StudySkillTreeProps | StudyAssignmentProps) {
  const { studyAhead, essentialOnly } = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const studyAhead = urlParams.get('studyAhead') === 'true';
    const essentialOnly = urlParams.get('essentialOnly') === 'true';

    return { studyAhead, essentialOnly };
  }, []);

  const [studyData, dispatchStudyData] = useAsyncDispatch<ReviewInstanceStudy, StudyAnswerEvent>(
    apiReviewInstanceStudy,
    [parseInt(deckId), section, parseInt(assignmentId), studyAhead, essentialOnly],
    studyAnswerReducer,
  );

  const [fetchedDeck] = useAsyncState<Deck>(
    async () => backendFetch('GET', `teachers/assignment/${assignmentId}/get-deck/`),
    [], undefined,
    !deckId,
  );

  if (!studyData)
    return <p className='text-center mt-5'>Loading…</p>

  return (
    <StudyAnswerDispatch.Provider value={dispatchStudyData}>
      <StudyReviewInstances
        reviewInstances={studyData.due_for_review}
        numTotal={studyData.num_total}
        deckId={parseInt(deckId) ?? fetchedDeck?.id}
        section={section}
        assignmentId={parseInt(assignmentId)}
        studyAhead={studyAhead}
        isPro={isPro.toLowerCase() === 'true'}
      />
    </StudyAnswerDispatch.Provider>
  );
}
