import { ReviewInstanceStudy, StudyAnswerDispatch, StudyAnswerEvent, studyAnswerReducer } from './context';
import { StudyReviewInstances } from './review-instances';
import { apiReviewInstanceStudy, useAsyncDispatch } from '../../lookup/lookup';
import { useMemo } from 'react';


interface StudySkillTreeProps {
  deckId: string;
  section: string;
  isPro: 'true' | 'false';
}
export default function StudySkillTree({ deckId, section, isPro }: StudySkillTreeProps) {
  const studyAhead = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const studyAhead = urlParams.get('studyAhead') === 'true';

    return studyAhead ?? false;
  }, []);
  const [studyData, dispatchStudyData] = useAsyncDispatch<ReviewInstanceStudy, StudyAnswerEvent>(
    apiReviewInstanceStudy,
    [parseInt(deckId), section, studyAhead],
    studyAnswerReducer,
  );

  if (!studyData)
    return <p className='text-center mt-5'>Loading…</p>

  return (
    <StudyAnswerDispatch.Provider value={dispatchStudyData}>
      <StudyReviewInstances
        reviewInstances={studyData.due_for_review}
        numTotal={studyData.num_total}
        deckId={parseInt(deckId)}
        section={section}
        studyAhead={studyAhead}
        isPro={isPro.toLowerCase() === 'true'}
      />
    </StudyAnswerDispatch.Provider>
  );
}
