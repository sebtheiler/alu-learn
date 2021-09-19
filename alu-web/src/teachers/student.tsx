import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { DeckForeignUserButtonGroup } from '../decks/buttons';
import { SharedDeck, Deck } from '../decks/types';
import { apiClassroomDetail, apiClassroomGetStudentDeck, apiClassroomStudentAttachDeck, apiDeckQuickList } from '../lookup';
import { errorHandler, useApiObjectHook } from '../utils';
import { Classroom } from './types';


export function ClassroomStudentDetail({ classroomId, studentId }) {
  const [classroom] = useApiObjectHook<Classroom>(apiClassroomDetail, 200, 8010, [parseInt(classroomId)]);
  const [studentDeck] = useApiObjectHook<SharedDeck>(apiClassroomGetStudentDeck, 200, 8011, [parseInt(classroomId), parseInt(studentId)]);
  const [decks] = useApiObjectHook<Deck[]>(
    apiDeckQuickList,
    200,
    8005,
    [false, true],
  );
  const [attachLoading, setAttachLoading] = useState(false);

  const attachDeck = event => {
    event.preventDefault();
    if (!attachLoading) {
      setAttachLoading(true);
      const form = event.target;
      const deckIdToAttach = parseInt(form.elements.deckToAttach.value);

      if (!deckIdToAttach) {setAttachLoading(false); return};
      apiClassroomStudentAttachDeck(classroomId, deckIdToAttach, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error attaching student deck to classroom
          errorHandler(response, status, 8012);
        }
      });
    }
  }

  return (<div className='text-center container-fluid mt-5'>
    <h1>{classroom?.title ?? 'Loading...'}</h1>
    <h3 className='mt-3'>Classroom Deck</h3>
    {classroom?.deck ? <>
      <h5>{(classroom as Classroom)?.deck?.title}</h5>
      <DeckForeignUserButtonGroup deck={(classroom as Classroom)?.deck} hideCopy={!(!studentDeck && !(studentDeck === undefined))} />
      <br />
      {studentDeck ?
        <p>You've attached a deck to this class: "{studentDeck.title}"</p>
      : <>
        {decks && <>
          <p>If you've already started studying, you can attach a deck below</p>
          <Form onSubmit={attachDeck}>
            <Form.Group className='container'>
              <hr />
              <Form.Label htmlFor='deckToAttach'>Attach Deck to Class</Form.Label>
              <Form.Control
                as='select'
                name='deckToAttach'
                custom
              >
                <option value='0'>-----</option>
                {decks.map((deck, i) => (
                  <option value={deck.id} key={i}>
                    {deck.title}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button type='submit' id='attach-deck-btn'>
              {attachLoading ? 'Attaching...' : 'Attach Deck'}
            </Button>
          </Form>
        </>}
      </>}
    </> : <>
      <p>Your teacher hasn't attached a deck to this class yet.  Check back soon!</p>
    </>}
  </div>);
}