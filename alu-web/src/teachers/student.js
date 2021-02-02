import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { DeckForeignUserButtonGroup } from '../decks/buttons';
import { apiClassroomDetail, apiClassroomGetStudentDeck, apiClassroomStudentAttachDeck, apiDeckHome } from '../lookup';
import { errorHandler, useApiObjectHook } from '../utils';


export function ClassroomStudentDetail({ classroomId, studentId }) {
  const [classroom] = useApiObjectHook(apiClassroomDetail, 200, 8010, [parseInt(classroomId)]);
  const [studentDeck] = useApiObjectHook(apiClassroomGetStudentDeck, 200, 8011, [parseInt(classroomId), parseInt(studentId)]);
  const [decks] = useApiObjectHook(
    apiDeckHome,
    200,
    8005,
    [], null,
    response => response.results.filter(deck => deck.serializer_name === 'deck').sort(deck => deck.title),
  );
  const [attachLoading, setAttachLoading] = useState(false);

  const attachDeck = event => {
    event.preventDefault();
    if (!attachLoading) {
      setAttachLoading(true);
      const form = event.target;
      const deckIdToAttach = parseInt(form.elements.deckToAttach.value);

      if (!deckIdToAttach) return;
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
    <h1>{classroom?.title}</h1>
    <h3 className='mt-3'>Classroom Deck</h3>
    {classroom?.deck ? <>
      <h5>{classroom?.deck?.title}</h5>
      <DeckForeignUserButtonGroup deck={classroom?.deck} hideCopy={!(!studentDeck && !(studentDeck === undefined))} />
      <br />
      {studentDeck ?
        <p>You've attached a deck to this class: "{studentDeck.title}"</p>
      : <>
        <p>If you've already started studying, you can attach a deck below</p>
        {decks && <Form onSubmit={attachDeck}>
          <Form.Group className='container'>
            <hr />
            <Form.Label htmlFor='deckToAttach'>Attach Deck to Class</Form.Label>
            <Form.Control
              as='select'
              name='deckToAttach'
              custom
            >
              <option value='0'>-----</option>
              {decks.map((classroom, i) => (
                <option value={classroom.id} key={i}>{classroom.title}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button type='submit'>
            {attachLoading ? 'Attaching...' : 'Attach Deck'}
          </Button>
        </Form>}
      </>}
    </> : <>
      <p>Your teacher hasn't attached a deck to this class yet.  Check back soon!</p>
    </>}
  </div>);
}