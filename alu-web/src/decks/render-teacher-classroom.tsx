import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import LoadingButton from './buttons/LoadingButton';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { Assignment, Classroom, Student } from '../teachers/types';
import { CreateDeckModal } from './buttons/create-deck';
import { Deck } from './types';
import { HomeActionDispatch } from './context';
import { FormCheckbox, Jdenticon, QuestionBubble } from '../utils';
import { SharedDeck } from './types';
import { backendFetch, useAsyncState, useObjectList, apiClassroomStudentsList, apiObjectCreate } from '../lookup/lookup';
import { useContext, useMemo, useState } from 'react';
import './render-classroom.scss';

export default function RenderTeacherClassroom({ classroom }: { classroom?: Classroom }) {
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

function AssignmentsList({ classroom }: { classroom: Classroom }) {
  const [assignments, setAssignments] = useAsyncState<Assignment[]>(
    () => backendFetch('GET', `teachers/classroom/${classroom.id}/assignments/`),
    [],
  );

  if (!assignments) return <p>Loading…</p>;
  return (<Container>
    {assignments.map(assignment =>
      <div key={assignment.id} className='assignment-row'>
        <div>
          <h4 className='text-center'>{assignment.title}</h4>
        </div>
        <div>
          <p>
            Assigned sections: {assignment.sub_sections.map((subSection, i) =>
              <>{subSection.data.title}{i !== assignment.sub_sections.length - 1 && ', '}</>
            )}
          </p>
        </div>
      </div>
    )}
    {assignments?.length === 0 && <p>You haven't created any assignments yet</p>}
    <CreateAssignmentButton
      classroom={classroom}
      assignments={assignments}
      setAssignments={setAssignments}
    />
  </Container>);
}

function StudentsList({ classroomId }: { classroomId: number }) {
  const [students] = useAsyncState<Student[]>(
    apiClassroomStudentsList,
    [classroomId, new Date().getTimezoneOffset()],
    undefined,
  );

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

interface CreateAssignmentButtonProps {
  classroom: Classroom;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[] | undefined>>;
}
function CreateAssignmentButton({ classroom, assignments, setAssignments }: CreateAssignmentButtonProps) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { classrooms } = useContext(HomeActionDispatch)
  const mainSections = useMemo(() => {
    if (!classroom.shared_deck) return [];
    const sortedSnapshots = classroom.shared_deck.snapshots.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const latestSnapshot = sortedSnapshots[0];

    return latestSnapshot.main_sections;
  }, [classroom]);

  const createAssignment = async () => {
    const form = document.getElementById('assignment-form') as any;
    const assignment_title = form.elements.assignmentTitle.value;
    const section_ids = Array.from(form.elements.sections).filter((section: any) => section.selected).map((section: any) => section.value);
    const classroom_ids = Array.from(form.elements.classrooms).filter((classroom: any) => classroom.selected).map((classroom: any) => parseInt(classroom.value));
    const essential_only = form.elements.essentialOnly.checked;

    await apiObjectCreate<Assignment>('teachers', 'assignment', {
      assignment_title,
      section_ids,
      classroom_ids,
      essential_only,
    }).then(
      assignment => setAssignments([...assignments, assignment]),
    ).then(
      () => setModalIsOpen(false),
    );
  }

  return (<>
    <Button onClick={() => setModalIsOpen(true)}>Create Assignment</Button>
    <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>
          Creating Assignment
        </Modal.Title>
      </Modal.Header>
      <Form id='assignment-form'>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              Assignment Title
            </Form.Label>
            <Form.Control
              type='text'
              name='assignmentTitle'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Sections to Assign<br />
              <small>Hold down "Control" ("Command" on a Mac) to select more than one</small>
            </Form.Label>
            <Form.Control
              as='select'
              name='sections'
              style={{ height: '250px' }}
              multiple
              custom
            >
              {mainSections.map(mainSection =>
                <optgroup label={mainSection.data.title} key={mainSection.id}>
                  {mainSection.sub_sections.map(subSection =>
                    <option value={subSection.id} key={subSection.id}>{subSection.data.title}</option>
                  )}
                </optgroup>
              )}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Assign to Classrooms<br />
              <small>Hold down "Control" ("Command" on a Mac) to select more than one</small>
            </Form.Label>
            <Form.Control
              as='select'
              name='classrooms'
              defaultValue={[classroom.id.toString()]}
              multiple
              custom
            >
              {classrooms?.map(classroom =>
                <option value={classroom.id} key={classroom.id}>{classroom.title}</option>
              )}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <FormCheckbox name='essentialOnly'>
              Essential only?{' '}
              <QuestionBubble>
                Only assign flashcards with the "essential" tag
              </QuestionBubble>
            </FormCheckbox>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            <LoadingButton clickFunc={createAssignment}>
              Create
            </LoadingButton>
            <Button
              onClick={() => setModalIsOpen(false)}
              className='ml-1'
              variant='secondary'
            >
              Close
            </Button>
          </ButtonGroup>
        </Modal.Footer>
      </Form>
    </Modal>
  </>);
}
