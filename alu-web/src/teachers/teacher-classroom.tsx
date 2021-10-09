import AttachDeckModal from './buttons/attach-deck';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Col';
import CreateAssignmentButton from './buttons/create-assignment';
import Row from 'react-bootstrap/Row';
import TeacherAssignment from './teacher-assignment';
import useMountEffect from '../utils/useMountEffect';
import { Assignment, Classroom, Student } from './types';
import { CreateDeckModal } from '../decks/buttons/create-deck';
import { Deck, SharedDeck } from '../decks/types';
import { Jdenticon } from '../utils';
import { HomeActionDispatch } from '../decks/context';
import { backendFetch, useAsyncState, apiClassroomStudentsList } from '../lookup/lookup';
import { useContext, useState } from 'react';
import './teacher-classroom.scss';

export default function TeacherClassroom({ classroom }: { classroom?: Classroom }) {
  const [selectedTab, setSelectedTab] = useState('ASSIGNMENTS');

  if (!classroom) return <p>Loading…</p>;
  return (
    <div className='mb-3'>
      <h1 className='text-center'>{classroom.title}</h1>
      <p className='text-center mb-0'>Classroom code: {classroom.code}</p>
      <small className='text-center text-secondary'>Give this code to your students so they can join your class</small>
      <hr />
      <div>
        {!classroom.shared_deck
          ? <ChooseClassroomDeck classroom={classroom} />
          : <div>
              <h3>Attached Deck: {classroom.shared_deck.title}</h3>
              <br />
              <Row>
                <Col onClick={() => setSelectedTab('ASSIGNMENTS')} role='button'>
                  <h3 className={selectedTab === 'ASSIGNMENTS' ? 'font-weight-bold' : ''}>Assignments</h3>
                </Col>
                <Col onClick={() => setSelectedTab('STUDENTS')} role='button'>
                  <h3 className={selectedTab === 'STUDENTS' ? 'font-weight-bold' : ''}>Students</h3>
                </Col>
              </Row>
              <Row>
                {selectedTab === 'ASSIGNMENTS' && <AssignmentsList classroom={classroom} />}
                {selectedTab === 'STUDENTS' && <StudentsList classroomId={classroom.id} />}
              </Row>
            </div>
        }
      </div>
    </div>
  );
}

function ChooseClassroomDeck({ classroom }: { classroom: Classroom }) {
  const { classroomsDispatch } = useContext(HomeActionDispatch)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);

  const attachDeckToClassroom = async (deck: Deck) => {
    if (!classroomsDispatch) return;

    const sharedDeck = await backendFetch<SharedDeck>('POST', `teachers/classroom/${classroom.id}/attach/`, {
      deck_id: deck.id,
    });

    classroomsDispatch({
      action: 'EDIT',
      editedValues: {
        shared_deck: sharedDeck,
        id: classroom.id,
      },
    });
  }

  return (<>
    <p>Your classroom needs to have a deck that your students can use.  Would you like to…</p>
    <Row className='mt-3'>
      <Col md={6} xs={12} className='text-center'>
        <div className='choose-deck-option' onClick={() => setShowCreateModal(true)}>
          <div className='choose-deck-icon'>
            <i className='fas fa-plus fa-10x' />
          </div>
          <div className='choose-deck-text'>
            <p className='choose-deck-title'>Create New Deck</p>
          </div>
        </div>
        <CreateDeckModal
          show={showCreateModal}
          close={() => setShowCreateModal(false)}
          callback={attachDeckToClassroom}
        />
      </Col>
      <Col md={6} xs={12} className='text-center'>
        <div className='choose-deck-option'>
          <div className='choose-deck-icon' onClick={() => setShowAttachModal(true)}>
            <i className='fas fa-link fa-10x' />
          </div>
          <div className='choose-deck-text'>
            <p className='choose-deck-title'>Attach Existing Deck</p>
          </div>
          <AttachDeckModal
            show={showAttachModal}
            close={() => setShowAttachModal(false)}
            callback={attachDeckToClassroom}
          />
        </div>
      </Col>
    </Row>
  </>);
}

function AssignmentsList({ classroom }: { classroom: Classroom }) {
  const [assignments, setAssignments, , setAssignmentsDidSet] = useAsyncState<Assignment[]>(
    () => backendFetch('GET', `teachers/classroom/${classroom.id}/assignments/`),
    [],
  );

  useMountEffect(() => {
    setAssignmentsDidSet(false);
  }, [classroom.id, setAssignmentsDidSet]);

  if (!assignments) return <p>Loading…</p>;
  return (<Container>
    {assignments.map(assignment =>
      <TeacherAssignment
        assignment={assignment}
        classroomId={classroom.id}
        key={assignment.id}
      />)
    }
    {assignments?.length === 0 && <p>You haven't created any assignments yet</p>}
    <CreateAssignmentButton
      classroom={classroom}
      assignments={assignments}
      setAssignments={setAssignments}
    />
  </Container>);
}

function StudentsList({ classroomId }: { classroomId: number }) {
  const [students, , , setStudentsDidSet] = useAsyncState<Student[]>(
    apiClassroomStudentsList,
    [classroomId, new Date().getTimezoneOffset()],
    undefined,
  );

  useMountEffect(() => {
    setStudentsDidSet(false);
  }, [classroomId, setStudentsDidSet]);

  if (!students) return <p>Loading…</p>;
  return (<Container>
    {students.map(student =>
      <Row key={student.username} className='student-row'>
        <Jdenticon value={student.username} size={30} />
        <p style={{ marginTop: '3px' }}>{student.first_name} {student.last_name}</p>
      </Row>
    )}
    {students.length === 0 && <p>You have no students yet.  Invite some with your class code.</p>}
  </Container>);
}
