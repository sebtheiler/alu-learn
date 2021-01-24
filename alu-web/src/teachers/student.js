import React from 'react';
import { DeckForeignUserButtonGroup } from '../decks/buttons';
import { apiClassroomDetail } from '../lookup';
import { useApiObjectHook } from '../utils';


export function ClassroomStudentDetail({ classroomId }) {
  const [classroom] = useApiObjectHook(apiClassroomDetail, 200, 8010, [parseInt(classroomId)]);
  const deck = classroom?.deck;

  return (<div className='text-center container-fluid'>
    <h1>{classroom?.title}</h1>
    <h3 className='mt-3'>Classroom Deck</h3>
    {deck ? <>
      <h5>{deck?.title}</h5>
      <DeckForeignUserButtonGroup deck={deck} />
    </> : <>
      <p>Your teacher hasn't attached a deck to this class yet.  Check back soon!</p>
    </>}
  </div>);
}