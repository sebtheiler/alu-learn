import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Container from 'react-bootstrap/Container';
import DataTable from 'react-data-table-component';
import { DefaultSharedDeckButtons } from '../decks/buttons';
import { FlashcardTypesPiechart, HistoryLineChart, parseStats } from '../decks/statistics/statistics';
import { Deck } from '../decks/types';
import { apiClassroomAttachDeck, apiClassroomDetail, apiClassroomStudentsList, apiClassroomStudentStats, apiQuickDeckList, apiStudentPercentCompleteList, apiTeacherAssignmentsList } from '../lookup';
import { errorHandler, useApiObjectHook } from '../utils';
import { Assignment, Classroom, ParsedStats, Student } from './types';
import { CreateEditAssignmentModal } from './buttons';
import './detail.css';
import Chart from 'react-google-charts';


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


interface StudentDetailProps {
  data?: Student;
  classroomId?: number;
}
function ExpandableStudentDetailComponent(props: StudentDetailProps) {
  const { data, classroomId } = props;
  const [studentDeckNotFound, setStudentDeckNotFound] = useState(false);
  const [statistics] = useApiObjectHook<ParsedStats>(
    apiClassroomStudentStats,
    [200, 404],
    8011,
    [classroomId, data ? data.id : undefined],
    (response, status) => setStudentDeckNotFound(status === 404),
    response => parseStats(response, true),
  );

  const avgEase = (statistics as ParsedStats)?.avgEase;
  const studentHistory = (statistics as ParsedStats)?.studentHistory;

  return (<>
    <p className='mt-1'>Statistics For: {data?.first_name} {data?.last_name}</p>
    {studentDeckNotFound ? <>
      <p>It doesn't look like {data?.first_name} has copied the class deck yet.</p>
    </> : (statistics && <>
      <FlashcardTypesPiechart flashcardTypes={(statistics as ParsedStats)?.flashcardTypes} />
      {avgEase && <p className='text-left'>
        Average Ease (seen flashcards): {Math.round(avgEase*100)/100}
      </p>}
      {studentHistory && studentHistory.length > 1 ?
        <HistoryLineChart studentHistory={(statistics as ParsedStats)?.studentHistory} />
        :
        <p className='text-left'>
          A linechart will appear here once this student studies for two or more days.
        </p>
      }
    </>)}
  </>);
}


export function ClassroomDetail({ classroomId }) {
  const [classroom] = useApiObjectHook<Classroom>(apiClassroomDetail, 200, 8006, [classroomId]);
  const [viewSelection, setViewSelection] = useState<'STUDENTS' | 'ASSIGNMENTS'>('ASSIGNMENTS');

  if (!classroom) return 'Loading...';
  return (<div className='container-fluid text-center mb-5'>
    <h1 className='mt-5'>{classroom.title}</h1>
    <p className='mb-0'>Class Code: <strong>{classroom.code}</strong></p>
    <small className='text-muted'>
      Give the class code to your students so that they can join your class.
    </small>
    <ClassroomDeckComponent deck={classroom.deck} classroomId={classroomId} />
    <hr />
    <Row>
      <Col xs={6} onClick={() => setViewSelection('ASSIGNMENTS')}>
        <button className='not-a-button' id='assignments-tab'>
          <h3 className={viewSelection === 'ASSIGNMENTS' ? 'underline' : 'text-muted'}>
            Assignments
          </h3>
        </button>
      </Col>
      <Col xs={6} onClick={() => setViewSelection('STUDENTS')}>
        <button className='not-a-button' id='students-tab'>
          <h3 className={viewSelection === 'STUDENTS' ? 'underline' : 'text-muted'}>
            Students
          </h3>
        </button>
      </Col>
    </Row>
    <hr />
    {viewSelection === 'STUDENTS' ?
      <StudentDataTable classroomId={classroomId} />
    :
      <AssignmentsList classroomId={classroomId} attachedDeck={!!classroom.deck} />
    }
  </div>);
}


function StudentDataTable(props: { classroomId: number }) {
  const { classroomId } = props;
  const [students] = useApiObjectHook<Student[]>(apiClassroomStudentsList, 200, 8007, [classroomId, new Date().getTimezoneOffset()]);

  return (<>
    {students && <>
      <DataTable
        columns={columns}
        data={students}
        expandableRows
        expandOnRowClicked
        expandableRowsComponent={<ExpandableStudentDetailComponent classroomId={classroomId} />}
        noDataComponent={<p>You don't have any students yet.</p>}
        defaultSortFieldId='First Name'
        striped
      />
    </>}
  </>);
}


function AssignmentsList(props: { classroomId: number, attachedDeck: boolean }) {
  const { classroomId, attachedDeck } = props;
  const [assignments] = useApiObjectHook<Assignment[]>(apiTeacherAssignmentsList, 200, 8015, [classroomId]);

  return (<Container>
    {assignments !== undefined && (assignments.length > 0 ?
    assignments.map((assignment, index) =>
      <RenderAssignment assignment={assignment} key={index} />
    ) : <p>
      {attachedDeck ?
        'You don\'t have any assignments yet.  Click the button above to create one.' :
        'You can create assignments after you attach a deck.'
      }
    </p>)}
  </Container>);
}


type StudentPercentData = { name: string, percent_complete: number };
function RenderAssignment(props: { assignment: Assignment }) {
  const { assignment } = props
  const [expanded, setExpanded] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentData] = useApiObjectHook<(number | string)[]>(
    apiStudentPercentCompleteList,
    200, 8016,
    [assignment.classroom, assignment.id],
    null,
    (response: StudentPercentData[]) => response.map(
      data => [data.name, data.percent_complete ?? 0]
    ).sort((a, b) => (a[1] as number) - (b[1] as number)),
    expanded,
  );

  const onEdit = event => {
    event.preventDefault();
    event.stopPropagation();
    setShowEditModal(true);
  }

  return (<>
    <div className='assignment' onClick={() => setExpanded(!expanded)}>
      <h4 className='mb-0'>{assignment.title}</h4>
      <p className='text-muted mb-2'>
        {new Date(assignment.due_date).toDateString()}
      </p>
      <ButtonGroup>
        <Button className='mb-2 edit-assignment-btn' onClick={onEdit}>
          Edit
        </Button>
        <CreateEditAssignmentModal
          classroomId={assignment.classroom}
          onHide={() => setShowEditModal(false)}
          showModal={showEditModal}
          assignment={assignment}
        />
      </ButtonGroup><br />
      <small className='text-muted'>
        (click to expand)
      </small>
      {studentData && studentData.length === 0 &&<p>
        No student data
      </p>}
      {expanded && studentData && studentData.length > 0 && <Chart
        width='100%'
        height={`${Math.max(studentData.length * 50, 300)}px`}
        chartType='BarChart'
        loader={<div>Loading...</div>}
        data={[
          ['Name', 'Percent Complete'] as (number | string)[],
        ].concat(studentData)}
        options={{
          title: 'Percent Complete by Student',
          chartArea: { width: '50%' },
          hAxis: {
            title: 'Percent Complete',
            format: 'percent',
            minValue: 0,
            maxValue: 1,
          },
          vAxis: {
            title: 'Student',
          },
        }}
      />}
    </div>
  </>);
}


function ClassroomDeckComponent({ classroomId, deck }) {
  const [decks] = useApiObjectHook<Deck[]>(
    apiQuickDeckList,
    200,
    8008,
    [false, false],
    null, null,
    !deck,
  );
  const [attachLoading, setAttachLoading] = useState(false);
  const [showModal, setShowModal] = useState(false)

  const attachDeck = event => {
    event.preventDefault();

    if (!attachLoading) {
      setAttachLoading(true);
      const form = event.target;
  
      const deckId = parseInt(form.elements.attachedDeck.value);
      if (deckId < 1) {
        setAttachLoading(false);
        return;
      }
  
      apiClassroomAttachDeck(classroomId, deckId, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error attaching deck to classroom
          errorHandler(response, status, 8009);
          setAttachLoading(false);
        }
      });
    }
  }

  return (<>
    <h3 className='mt-3'>Classroom Deck</h3>
    {deck ? <>
      <h5>{deck.title}</h5>
      <small className='text-muted'>
        To add flashcards to this deck, add flashcards to the deck it was created from,{' '}
        then click "Push Changes."
      </small><br />
      <DefaultSharedDeckButtons deck={deck} hideUpdateSettings /><br />
      <Button onClick={() => setShowModal(true)} className='mt-1' id='create-assignment-btn'>
        Create Assignment
      </Button>
      <CreateEditAssignmentModal
        classroomId={classroomId}
        onHide={() => setShowModal(false)}
        showModal={showModal}
      />
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
              <option value={deck.id} key={deck.id}>
                {deck.title}
              </option>
            ) :
              <option value='-1'>Loading...</option>
            }
          </Form.Control>
          <Button type='submit' className='mt-1' id='attach-deck-btn'>
            {attachLoading ? 'Attaching...' : 'Attach Deck'}
          </Button>
        </Form.Group>
      </Form> :
      <p>You don't have any decks yet.  Please create or copy one first.</p>}
    </>}
  </>);
}
