import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import DatePicker from 'react-date-picker';
import { apiClassroomCreate, apiClassroomDelete, apiClassroomEdit, apiCreateAssignment, apiDeleteAssignment, apiEditAssignment } from '../lookup';
import { addDays, errorHandler, FormCheckbox, LoadingButton, QuestionBubble } from '../utils';
import { Assignment, Classroom } from './types';
import './buttons.css';


export function ClassroomDefaultButtonGroup({ classroom }) {
  return (
    <ButtonGroup>
      <ClassroomEditCreateButton classroom={classroom} />
      <Button href={`/classrooms/${classroom.id}/`} className='ml-1 classroom-view-btn'>
        View
      </Button>
    </ButtonGroup>
  );
}


interface ClassroomEditCreateButtonProps {
  classroom?: Classroom;
  id?: string;
}
export function ClassroomEditCreateButton(props: ClassroomEditCreateButtonProps) {
  const { classroom, id } = props;
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);

  const handleSubmit = event => {
    event.preventDefault();
    const form = event.target;

    if (classroom) {
      // Edit the classroom
      if (form.elements.title.value === classroom.title) return;

      apiClassroomEdit(classroom.id, form.elements.title.value, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error editing classroom
          errorHandler(response, status, 8001);
        }
      });
    } else {
      // Create a new classroom
      apiClassroomCreate(form.elements.title.value, (response, status) => {
        if (status === 201) {
          window.location.reload();
        } else {
          // Error creating classroom
          errorHandler(response, status, 8002);
        }
      });
    }
  }

  const deleteHandler = () => {
    if (classroom && window.prompt(`
Are you sure you want to delete this classroom?  This action is instant and irreversible.
If you wish to continue, please type "DELETE", without the quotes.
    `) === 'DELETE') {
      apiClassroomDelete(classroom!.id, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error deleting classroom
          errorHandler(response, status, 8003);
        }
      })
    }
  }

  return (<>
    <Button onClick={() => setEditModalIsOpen(true)} id={id} className={classroom ? 'classroom-edit-btn' : undefined}>
      {classroom ? 'Edit' : 'Create Classroom'}
    </Button>
    <Modal show={editModalIsOpen} onHide={() => setEditModalIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>{classroom ? `Editing "${classroom.title}"` : 'Creating a Class'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor='title'>Title</Form.Label>
            <Form.Control
              type='text'
              placeholder='My class'
              name='title'
              defaultValue={classroom?.title}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {classroom &&
            <Button onClick={deleteHandler} variant='danger' className='mr-auto'>
              Delete "{classroom.title}"
            </Button>
          }
          <Button onClick={() => setEditModalIsOpen(false)} variant='secondary'>
            Cancel
          </Button>
          <Button type='submit' className='ml-1' id='create-edit-btn'>
            {classroom ? 'Save' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  </>);
}

interface CreateEditAssignmentModalProps {
  classroomId: number;
  onHide(): void;
  showModal: boolean;
  assignment?: Assignment;
}
export function CreateEditAssignmentModal(props: CreateEditAssignmentModalProps) {
  const { classroomId, onHide, showModal, assignment } = props;
  const [dueDate, setDueDate] = useState(assignment ? new Date(assignment?.due_date) : new Date());

  const handleSubmit = event => {
    event.preventDefault();
    const form = event.target;

    // TODO: for some reason, the dueDate is one day behind what it appears
    // to be selected, so we need to add one day to it
    const dueDateString = addDays(dueDate, 1).toISOString().slice(0, 10);

    if (assignment) {
      apiEditAssignment(
        classroomId,
        assignment.id,
        form.elements.title.value,
        form.elements.tagQuery.value,
        dueDateString,
        (response, status) => {
          if (status === 200) {
            window.location.reload();
          } else {
            // Error editing assignment
            errorHandler(response, status, 8016);
          }
        },
      );
    } else {
      apiCreateAssignment(
        classroomId,
        form.elements.title.value,
        form.elements.tagQuery.value,
        dueDateString,
        form.elements.essentialCopy.checked,
        (response, status) => {
          if (status === 201) {
            window.location.reload();
          } else {
            // Error creating new assignment
            errorHandler(response, status, 8014);
          }
        },
      );
    }
  }

  const predictTagQuery = () => {
    const el = document.getElementsByName('title')[0] as HTMLInputElement;
    if (!el) return;
    const title = el.value;
    const regex = /unit \d*/gmi;
    const matches = title.match(regex);
    if (!matches) return;
    const match = matches[0];
    const unitNumMatch = match.match(/\d+/);
    if (!unitNumMatch) return;
    const unitNum = unitNumMatch[0];
    const tagQueryEl = document.getElementsByName('tagQuery')[0] as HTMLInputElement;
    if (!tagQueryEl || tagQueryEl.value) return;
    let value = `unit ${unitNum}`;
    if (title.toLowerCase().includes('essential'))
      value += ' AND essential';
    tagQueryEl.value = value;
  }

  const handleDelete = event => {
    event.preventDefault();
    event.stopPropagation();
    if (!assignment || !window.confirm('Are you sure you want to delete this assignment? This will NOT delete any of your flashcards nor will it reset your students\' progress.')) return;
    apiDeleteAssignment(classroomId, assignment.id, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        // Error deleting assignment
        errorHandler(response, status, 8017);
      }
    });
  }

  return (<>
    <Modal show={showModal} onHide={onHide} onClick={e => e.stopPropagation()}>
      <Modal.Header>
        <Modal.Title>
          {assignment ? `Editing ${assignment.title}` : 'Creating a new Assignment'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p>
            Assignments are how you tell students what work they should do.{' '}
            You can assign different work based on your tag query.
          </p>
          <Form.Group>
            <Form.Label>
              Assignment Title
            </Form.Label>
            <Form.Control
              type='text'
              name='title'
              onBlur={predictTagQuery}
              defaultValue={assignment?.title}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              Tag Query<br />
              <small className='text-muted'>
                You can use logical operators like AND, OR, and NOT<br />
                (e.g.: unit 1 AND essential)
              </small>
            </Form.Label>
            <Form.Control
              type='text'
              name='tagQuery'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Due Date</Form.Label>
            <DatePicker
              onChange={date => setDueDate(date as Date)}
              value={dueDate}
              minDate={new Date()}
              className='form-control'
            />
          </Form.Group>
          {!assignment && <Form.Group>
            <FormCheckbox name='essentialCopy'>
              Create essential-only copy of this assignment?{' '}
              <QuestionBubble>
                If checked, this will create two assignments.
                One with the tag query you specified above, and the other with
                the same query but with "AND essential" added on.
              </QuestionBubble>
            </FormCheckbox>
          </Form.Group>}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide} variant='secondary' className='mr-auto'>
            Cancel
          </Button>
          {assignment && <Button variant='danger' onClick={handleDelete}>
            Delete
          </Button>}
          <LoadingButton loadingMessage='Loading...' type='submit' id='assignment-edit-create-btn'>
            {assignment ? 'Save' : 'Create Assignment'}
          </LoadingButton>
        </Modal.Footer>
      </Form>
    </Modal>
  </>);
}
