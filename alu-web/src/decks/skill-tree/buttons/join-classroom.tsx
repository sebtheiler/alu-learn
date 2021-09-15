import Form from 'react-bootstrap/Form';
import LoadingButton from './LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { HomeActionDispatch } from '../context';
import { apiClassroomStudentJoin } from '../../../lookup/lookup';
import { useContext, useState } from 'react';
import { has } from '../../../utils';

export default function JoinClassroomButton() {
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (<>
    <div className='deck-selection-item mb-5'>
      <div
        className='deck-selection-main mb-0'
        role='button'
        onClick={() => setShowJoinModal(true)}
      >
        <p>
          <span className='title-text'>Join Classroom</span>
          <span><i className='fas fa-plus fa-2x float-left mt-2 ml-2' /></span>
        </p>
      </div>
    </div>
    <JoinModal
      show={showJoinModal}
      close={() => setShowJoinModal(false)}
    />
  </>);
}


interface JoinModalProps {
  show: boolean;
  close(): void;
}
function JoinModal({ show, close }: JoinModalProps) {
  const { classroomsDispatch } = useContext(HomeActionDispatch);
  const [error, setError] = useState<'NOT_FOUND' | 'DIFFERENT_DOMAIN'>();

  const joinClassroom = async (classroomCode: string) => {
    await apiClassroomStudentJoin(classroomCode).then(
      classroom => {
        if (has(classroom, 'message')) {
          if (classroom.message === 'Classroom not found') {
            setError('NOT_FOUND');
          } else if (classroom.message === 'You may only join classes in the same domain') {
            setError('DIFFERENT_DOMAIN');
          }

          return;
        }
        
        if (classroomsDispatch) {
          classroomsDispatch({ action: 'CREATE', classroom: classroom });
          setError(undefined);
          close();
        }
      }
    );
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header>
        <Modal.Title>Joining classroom</Modal.Title>
      </Modal.Header>
      <Form name='joinClassroomForm'>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              <p className='mb-0'>Classroom Code</p>
              <small className='text-secondary'>Ask your teacher for a classroom code to join their class</small>
            </Form.Label>
            <Form.Control
              type='text'
              name='classroomCode'
              required
            />
          </Form.Group>
          {error  === 'NOT_FOUND' && <p className='text-danger'>Classroom not found.  Please check the code and try again.</p>}
          {error === 'DIFFERENT_DOMAIN' && <p className='text-danger'>
            You may only join classes with teachers that have the same email domain as you.  If needed,
            you can change your email in the <a href='/settings/'>settings</a>.
          </p>}
        </Modal.Body>
        <Modal.Footer>
          <LoadingButton
            clickFunc={async () => {
              const classroomCode = document.getElementsByName('classroomCode')[0] as HTMLFormElement;
              await joinClassroom(classroomCode.value);
            }}
            type='submit'
            block
          >
            Join
          </LoadingButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

