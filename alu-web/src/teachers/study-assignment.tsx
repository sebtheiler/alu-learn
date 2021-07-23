import React, { useMemo, useState } from 'react';
import { StudyLogicComponent } from '../decks/study/components';
import { ReviewInstance, SSMInterface } from '../decks/types';
import { apiAssignmentDetail, apiSSMDetail, apiStudyAssignment } from '../lookup';
import { useApiObjectHook } from '../utils';
import { Assignment } from './types';


type SSMFlashcardsReturn = {flashcards: ReviewInstance[], num_overflow: number};
export function StudyAssignment({ classroomId, assignmentId }) {
  const reviewOverflowBucket = useMemo(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('reviewOverflowBucket') === 'true';
  }, []);
  const [errorMsg, setErrorMsg] = useState('');
  const [numOverflow, setNumOverflow] = useState<number | undefined>(undefined);
  const [flashcards, setFlashcards] = useApiObjectHook<ReviewInstance[]>(
    apiStudyAssignment,
    [200, 400, 404], 8020,
    [classroomId, assignmentId, reviewOverflowBucket],
    (response: any, status: number) => {
      setErrorMsg(status !== 200 ? response.message : '');
      setNumOverflow(response.num_overflow);
    },
    (response: SSMFlashcardsReturn) => response.flashcards,
  );
  const [assignment] = useApiObjectHook<Assignment>(
    apiAssignmentDetail,
    [200, 400, 404], 8019,
    [classroomId, assignmentId],
    (response: any, status: number) => setErrorMsg(status !== 200 ? response.message : ''),
    null,
    !!flashcards,
  );
  const [SSM] = useApiObjectHook<SSMInterface>(
    apiSSMDetail,
    [200, 400, 404], 8021,
    [assignment?.study_session_manager],
    (response: any, status: number) => setErrorMsg(status !== 200 ? response.message : ''),
    null,
    !!assignment,
  );

  return (<>
    <h2 className='text-center mt-3'>
      Studying
    </h2>
    <div className='horizontal-rule mt-2 mb-4' />
    <StudyLogicComponent
      SSM={SSM}
      flashcards={flashcards}
      setFlashcards={setFlashcards}
      errorMsg={errorMsg}
      numOverflow={numOverflow}
      isAssignment
    />
  </>);
}
