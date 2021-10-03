import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { Classroom, Student } from '../teachers/types';
import { CreateDeckModal } from './buttons/create-deck';
import { Deck } from './types';
import { HomeActionDispatch } from './context';
import { Jdenticon } from '../utils';
import { SharedDeck } from './types';
import { backendFetch, useAsyncState, useObjectList, apiClassroomStudentsList } from '../lookup/lookup';
import { useContext, useState } from 'react';
import './render-classroom.scss';

export default function RenderTeacherClassroom({ classroom }: { classroom?: Classroom }) {
  const [selectedTab, setSelectedTab] = useState('ASSIGNMENTS');
  const [students] = useAsyncState<Student[]>(
    apiClassroomStudentsList,
    [classroom?.id, new Date().getTimezoneOffset()],
    undefined,
    !!classroom,
  );

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
                {selectedTab === 'ASSIGNMENTS' && <AssignmentsList />}
                {selectedTab === 'STUDENTS' && <StudentsList students={students} />}
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

interface AttachDeckModalProps {
  show: boolean;
  close(): void;
  callback(deck: Deck): void;
}
function AttachDeckModal({ show, close, callback }: AttachDeckModalProps) {
  const [decks] = useObjectList<Deck>('decks', 'deck');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header>
        <Modal.Title className='w-100'>
          Attaching deck
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {decks ? decks.map(deck =>
          <p
            className='searched-item text-center'
            onClick={() => {setIsLoading(true); callback(deck)}}
            role='button'
            key={deck.id}
          >
            {deck.title}
          </p>
        ) : <p>Loading…</p>}
        {decks?.length === 0 && <p>You don't have any decks yet.  Please create one first, using the other button.</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={close}>
          {isLoading
            ? <>Attach <Spinner animation='border' size='sm' /></>
            : 'Cancel'
          }
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function AssignmentsList() {
  return (<>
  </>);
}

function StudentsList({ students }: { students?: Student[] }) {
  if (!students) return <p>Loading…</p>;
  return (<Container>
    {students.map(student =>
      <Row key={student.username} className='student-row'>
        <Jdenticon value={student.username} size={30} />
        {student.first_name} {student.last_name}
      </Row>
    )}
    {students.length === 0 && <p>You have no students yet.  Invite some with your class code.</p>}
  </Container>);
}
