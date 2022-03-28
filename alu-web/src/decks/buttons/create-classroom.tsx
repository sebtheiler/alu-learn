import Form from 'react-bootstrap/Form';
import LoadingButton from './LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { Classroom } from '../../teachers/types';
import { HomeActionDispatch } from '../context';
import { apiObjectCreate } from '../../lookup/lookup';
import { useContext, useState } from 'react';
import TutorialPopup from '../../pages/tutorial';

export default function CreateClassroomButton() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createClassroomBtn, setCreateClassroomBtn] = useState<Element | null>(null);

  return (<>
    <div className='deck-selection-item mb-5'>
      <div
        className='deck-selection-main mb-0'
        role='button'
        onClick={() => setShowCreateModal(true)}
        ref={setCreateClassroomBtn}
      >
        <p>
          <span className='title-text'>Create New Classroom</span>
          <span><i className='fas fa-plus fa-2x float-left mt-2 ml-2' /></span>
        </p>
      </div>
    </div>
    <CreateModal
      show={showCreateModal}
      close={() => setShowCreateModal(false)}
    />
    <TutorialPopup
      referenceElement={createClassroomBtn}
      tutorialAttr='created_first_classroom'
    >
      Click here to create a new classroom
    </TutorialPopup>
  </>);
}


const editableAttrs = ['title'];
interface CreateModalProps {
  show: boolean;
  close(): void;
}
function CreateModal(props: CreateModalProps) {
  const { show, close } = props;
  const { classroomsTaughtDispatch } = useContext(HomeActionDispatch);

  const createClassroom = async (options) => {
    await apiObjectCreate<Classroom>('teachers', 'classroom', options).then(
      res => classroomsTaughtDispatch && classroomsTaughtDispatch({
        action: 'CREATE',
        classroom: res,
      }),
    );
    close();
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header>
        <Modal.Title>Creating classroom</Modal.Title>
      </Modal.Header>
      <Form name='createClassroomForm'>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
              type='text'
              name='title'
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <LoadingButton
            clickFunc={async () => {
              const form = document.getElementsByName('createClassroomForm')[0] as HTMLFormElement;
              if (!form) return;

              let createClassroomOptions = {};
              for (const el of form.elements) {
                let elName = (el as any).name;
                if (editableAttrs.includes(elName))
                  createClassroomOptions[elName] = (el as any).value;
              }

              await createClassroom(createClassroomOptions);
            }}
            type='submit'
            block
          >
            Create
          </LoadingButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
