import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import LoadingButton from '../../decks/buttons/LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { Assignment, Classroom } from '../types';
import { FormCheckbox, QuestionBubble } from '../../utils';
import { HomeActionDispatch } from '../../decks/context';
import { apiObjectCreate } from '../../lookup/lookup';
import { useContext, useMemo, useState } from 'react';

interface CreateAssignmentButtonProps {
  classroom: Classroom;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[] | undefined>>;
}
export default function CreateAssignmentButton({ classroom, assignments, setAssignments }: CreateAssignmentButtonProps) {
  const [modalIsOpen, setModalIsOpen] = useState(false);

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
    <CreateEditAssignmentModal
      modalIsOpen={modalIsOpen}
      setModalIsOpen={setModalIsOpen}
      classroom={classroom}
      createAssignment={createAssignment}
    />
  </>);
}

interface CreateEditAssignmentModalProps {
  modalIsOpen: boolean;
  setModalIsOpen(isOpen: boolean): void;
  classroom: Classroom;
  createAssignment?(): Promise<void>;
  editAssignment?(): Promise<void>;
  deleteAssignment?(): Promise<void>;
  assignment?: Assignment;
}
export function CreateEditAssignmentModal({ modalIsOpen, setModalIsOpen, classroom, createAssignment, editAssignment, deleteAssignment, assignment }: CreateEditAssignmentModalProps) {
  const { classroomsTaught } = useContext(HomeActionDispatch)
  const mainSections = useMemo(() => {
    if (!classroom.shared_deck) return [];
    const sortedSnapshots = classroom.shared_deck.snapshots.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    const latestSnapshot = sortedSnapshots[0];

    return latestSnapshot.main_sections;
  }, [classroom]);

  return (
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
              defaultValue={assignment?.title}
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
              defaultValue={assignment?.sub_sections?.map(s => s.id)}
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
              // @ts-ignore
              defaultValue={assignment?.classrooms ?? [classroom.id.toString()]}
              multiple
              custom
            >
              {classroomsTaught?.map(classroom =>
                <option value={classroom.id} key={classroom.id}>{classroom.title}</option>
              )}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <FormCheckbox name='essentialOnly' defaultChecked={assignment?.essential_only}>
              Essential only?{' '}
              <QuestionBubble>
                Only assign flashcards with the "essential" tag
              </QuestionBubble>
            </FormCheckbox>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <ButtonGroup>
            {createAssignment && <LoadingButton clickFunc={createAssignment}>
              Create
            </LoadingButton>}
            {editAssignment && <LoadingButton clickFunc={editAssignment}>
              Edit
            </LoadingButton>}
            {deleteAssignment && <LoadingButton clickFunc={deleteAssignment} variant='danger' className='ml-1'>
              Delete
            </LoadingButton>}
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
  );
}
