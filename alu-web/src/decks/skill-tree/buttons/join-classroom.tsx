import Form from 'react-bootstrap/Form';
import LoadingButton from './LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { HomeActionDispatch } from '../context';
import { apiClassroomStudentJoin } from '../../../lookup/lookup';
import { useContext, useState } from 'react';

export default function JoinClassroomButton() {
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (<>
    <div className='deck-selection-item mb-5 mt-4'>
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
function JoinModal(props: JoinModalProps) {
  const { show, close } = props;
  const { classroomsDispatch } = useContext(HomeActionDispatch);

  const joinClassroom = async (classroomCode: string) => {
    await apiClassroomStudentJoin(classroomCode).then(
      classroom => classroomsDispatch && classroomsDispatch({ action: 'CREATE', classroom: classroom })
    );
    close();
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

