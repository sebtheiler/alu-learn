import React, { useState } from 'react';
import { StudyLogicComponent } from '../decks/study/components';
import { FlashCard, SSMInterface } from '../decks/types';
import { apiAssignmentDetail, apiSSMDetail, apiStudyAssignment } from '../lookup';
import { useApiObjectHook } from '../utils';
import { Assignment } from './types';


export function StudyAssignment({ classroomId, assignmentId }) {
  const [notFound, setNotFound] = useState(false);
  const [flashcards, setFlashcards] = useApiObjectHook<FlashCard[]>(
    apiStudyAssignment,
    [200, 404], 8020,
    [classroomId, assignmentId],
    (_response, status) => setNotFound(status === 404),
  );
  const [assignment] = useApiObjectHook<Assignment>(
    apiAssignmentDetail,
    [200, 404], 8019,
    [classroomId, assignmentId],
    (_response, status) => setNotFound(status === 404),
    null,
    !!flashcards,
  );
  const [SSM] = useApiObjectHook<SSMInterface>(
    apiSSMDetail,
    [200, 404], 8021,
    [assignment?.study_session_manager],
    (_response, status) => setNotFound(status === 404),
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
      notFound={notFound}
      isAssignment
    />
  </>);
}
