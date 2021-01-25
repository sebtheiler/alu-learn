import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { DefaultSharedDeckButtons } from '../decks/buttons';
import { FlashcardTypesPiechart, HistoryLineChart, parseStats } from '../decks/statistics/statistics';
import { apiClassroomAttachDeck, apiClassroomDetail, apiClassroomStudentsList, apiClassroomStudentStats, apiDeckHome } from '../lookup';
import { errorHandler, useApiObjectHook } from '../utils';


const columns = [
  {
    name: 'First Name',
    selector: 'first_name',
    sortable: true,
  },
  {
    name: 'Last Name',
    selector: 'last_name',
    sortable: true,
  },
  {
    name: 'Streak',
    selector: 'current_streak',
    format: row => `${row.current_streak} day${row.current_streak === 1 ? '' : 's'}`,
    sortable: true,
  },
  {
    name: 'Flashcards done today',
    selector: 'today_stats.cards_done_today',
    sortable: true,
  },
  {
    name: 'Time spent today',
    selector: 'today_stats.time_spent_today',
    format: row => `${Math.round(row.today_stats.time_spent_today/1000/60)} minute${Math.round(row.today_stats.time_spent_today/1000/60) === 1 ? '' : 's'}`,
    sortable: true,
  },
];


// TODO: this triggers an API call everytime a row is expanded
function ExpandableStudentDetailComponent({ data, classroomId }) {
  const [studentDeckNotFound, setStudentDeckNotFound] = useState(false);
  const [statistics] = useApiObjectHook(
    apiClassroomStudentStats,
    [200, 404],
    8011,
    [classroomId, data.id],
    (response, status) => setStudentDeckNotFound(status === 404 && response.message === 'Student deck not found'),
    response => parseStats(response, 'TEACHER'),
  );
  console.log(statistics)

  return (<>
    <p className='mt-1'>Statistics For: {data.first_name} {data.last_name}</p>
    {studentDeckNotFound ? <>
      <p>It doesn't look like {data.first_name} has copied the class deck yet.</p>
    </> : <>
      <FlashcardTypesPiechart flashcardTypes={statistics?.flashcardTypes} />
      <p className='text-left'>Average Ease (seen flashcards): {Math.round(statistics?.avgEase*100)/100}</p>
      <HistoryLineChart studentHistory={statistics?.studentHistory} />
    </>}
  </>);
}


export function ClassroomDetail({ classroomId }) {
  const [classroom] = useApiObjectHook(apiClassroomDetail, 200, 8006, [classroomId]);
  const [students] = useApiObjectHook(apiClassroomStudentsList, 200, 8007, [classroomId, new Date().getTimezoneOffset()]);

  return (<div className='container-fluid text-center mb-5'>
    <h1 className='mt-5'>{classroom?.title}</h1>
    <p className='mb-0'>Class Code: <strong>{classroom?.code}</strong></p>
    <small className='text-muted'>Give the class code to your students so that they can join your class.</small>
    <ClassroomDeckComponent deck={classroom?.deck} classroomId={classroomId} />
    <hr />
    {students && <DataTable
      title='Students'
      columns={columns}
      data={students}
      expandableRows
      expandOnRowClicked
      expandableRowsComponent={<ExpandableStudentDetailComponent classroomId={classroomId} />}
      noDataComponent={<p>You don't have any students yet</p>}
      striped
    />}
  </div>);
}


function ClassroomDeckComponent({ classroomId, deck }) {
  const [decks] = useApiObjectHook(
    apiDeckHome,
    200,
    8008,
    [], null,
    response => response.results.filter(deck => deck.serializer_name === 'deck').sort(deck => deck.title),
  );

  const attachDeck = event => {
    event.preventDefault();
    const form = event.target;

    const deckId = parseInt(form.elements.attachedDeck.value);
    if (deckId < 1) return;

    apiClassroomAttachDeck(classroomId, deckId, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        // Error attaching deck to classroom
        errorHandler(response, status, 8009);
      }
    });
  }

  return (<>
    <h3 className='mt-3'>Classroom Deck</h3>
    {deck ? <>
      <h5>{deck.title}</h5>
      <small className='text-muted'>
        To add flashcards to this deck, add flashcards to the deck it was created from,{' '}
        then click "Push Changes."
      </small><br />
      <DefaultSharedDeckButtons deck={deck} />
    </> : <>
      {decks && decks.length > 0 ? <Form onSubmit={attachDeck}>
        <Form.Group className='container'>
          <Form.Label>Choose a Deck to Attach</Form.Label>
          <Form.Control
            as='select'
            name='attachedDeck'
            custom
          >
            <option value='-1'>-----</option>
            {decks ? decks.map(deck => 
              <option value={deck.id} key={deck.id}>{deck.title}</option>
            ) :
              <option value='-1'>Loading...</option>
            }
          </Form.Control>
          <Button type='submit' className='mt-1'>Attach Deck</Button>
        </Form.Group>
      </Form> :
      <p>You don't have any decks yet.  Please create or copy one first.</p>}
    </>}
  </>);
}
