import { useContext, useState } from 'react';
import { DeckDispatch } from '../context';
import { MainSection, SubSection } from '../types';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import LoadingButton from './LoadingButton';
import { apiObjectCreate, apiObjectDelete, apiObjectEdit } from '../../../lookup/lookup';

export function MainSectionButtons({ mainSection }: { mainSection: MainSection }) {
  const deckDispatch = useContext(DeckDispatch);

  const renameMainSection = () => {
    const title = window.prompt(`Renaming main section "${mainSection.title}"`) ?? mainSection.title;
    if (title === mainSection.title || !deckDispatch) return;

    deckDispatch({
      action: 'EDIT_MAIN_SECTION',
      deckId: mainSection.deck,
      mainSection: {
        title: title,
        id: mainSection.id
      },
    });
    apiObjectEdit<MainSection>('skill_tree', 'mainsection', mainSection.id, {
      title: title,
    });
  }

  const deleteMainSection = () => {
    if (!deckDispatch || !window.confirm('Are you sure you want to delete this main section?')) return;

    deckDispatch({
      action: 'DELETE_MAIN_SECTION',
      deckId: mainSection.deck,
      mainSectionId: mainSection.id,
    });
    apiObjectDelete<MainSection>('skill_tree', 'mainsection', mainSection.id);
  }

  return (
    <div className='main-section-buttons'>
      <OverlayTrigger
        overlay={
          <Tooltip id={`edit-main-section-tooltip-${mainSection.id}`}>
            Edit main section title
          </Tooltip>
        }
      >
        <i
          className='fas fa-pencil-alt'
          role='button'
          onClick={renameMainSection}
        />
      </OverlayTrigger>
      <OverlayTrigger
        overlay={
          <Tooltip id={`delete-main-section-tooltip-${mainSection.id}`}>
            Delete main section
          </Tooltip>
        }
      >
        <i
          className='fas fa-trash-alt ml-2'
          role='button'
          onClick={deleteMainSection}
        />
      </OverlayTrigger>
    </div>
  );
}

interface SubSectionButtonsProps {
  subSection: SubSection;
  mainSectionId: number;
  deckId: number;
}
export function SubSectionButtons({ subSection, mainSectionId, deckId }: SubSectionButtonsProps) {
  const deckDispatch = useContext(DeckDispatch);

  const renameSubSection = () => {
    const title = window.prompt(`Renaming sub section "${subSection.title}"`) ?? subSection.title;
    if (title === subSection.title || !deckDispatch) return;

    deckDispatch({
      action: 'EDIT_SUB_SECTION',
      deckId: deckId,
      mainSectionId: mainSectionId,
      subSection: {
        title: title,
        id: subSection.id,
      }
    });
    apiObjectEdit<MainSection>('skill_tree', 'subsection', subSection.id, {
      title: title,
    });
  }

  const deleteSubSection = () => {
    if (!deckDispatch || !window.confirm('Are you sure you want to delete this sub section?')) return;

    deckDispatch({
      action: 'DELETE_SUB_SECTION',
      deckId: deckId,
      mainSectionId: mainSectionId,
      subSectionId: subSection.id,
    });
    apiObjectDelete<MainSection>('skill_tree', 'subsection', subSection.id);
  }
  
  return (
    <div className='sub-section-buttons'>
      <OverlayTrigger
        overlay={
          <Tooltip id={`edit-sub-section-tooltip-${subSection.id}`}>
            Delete sub section
          </Tooltip>
        }
      >
        <i
          className='fas fa-trash-alt float-right ml-2'
          role='button'
          onClick={deleteSubSection}
        />
      </OverlayTrigger>
      <OverlayTrigger
        overlay={
          <Tooltip id={`edit-sub-section-tooltip-${subSection.id}`}>
            Edit sub section title
          </Tooltip>
        }
      >
        <i
          className='fas fa-pencil-alt float-right'
          role='button'
          onClick={renameSubSection}
        />
      </OverlayTrigger>
    </div>
  );
}

function AbstractSectionCreateForm({ callback }: { callback(title: string, description: string): Promise<void> }) {
  return (
    <Form>
      <Modal.Body>
        <Form.Group>
          <Form.Label>Title</Form.Label>
          <Form.Control
            type='text'
            name='section-create-title'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as='textarea'
            rows={3}
            name='section-create-description'
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <LoadingButton
          clickFunc={async () => await callback(
            (document.getElementsByName('section-create-title')[0] as HTMLInputElement).value,
            (document.getElementsByName('section-create-description')[0] as HTMLInputElement).value,
          )}
        >
          Create
        </LoadingButton>
      </Modal.Footer>
    </Form>
  );
}

export function CreateMainSectionButton({ deckId }: { deckId: number }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const deckDispatch = useContext(DeckDispatch);

  const createMainSectionCallback = async (title: string, description: string) => {
    if (!deckDispatch) return;
    await apiObjectCreate<MainSection>('skill_tree', 'subsection', {
      deckId: deckId,
      title: title,
      description: description,
    }).then(res =>
      deckDispatch({
        action: 'CREATE_MAIN_SECTION',
        deckId: res.deck,
        mainSection: res,
      })
    );
  }

  return (
    <div className='text-right'>
      <ButtonGroup>
        <Button
          variant='secondary'
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Mainsection
        </Button>
        <Modal show={isCreateModalOpen} onHide={() => setIsCreateModalOpen(false)}>
          <Modal.Header>
            <Modal.Title>
              Creating Mainsection
            </Modal.Title>
          </Modal.Header>
          <AbstractSectionCreateForm callback={createMainSectionCallback} />
        </Modal>
      </ButtonGroup>
    </div>
  );
}

export function CreateSubSectionButton({ mainSectionId }: { mainSectionId: number }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const deckDispatch = useContext(DeckDispatch);

  const createSubSectionCallback = async (title: string, description: string) => {
    if (!deckDispatch) return;
    await apiObjectCreate<
      { deckId: number, mainSectionId: number, subsection: SubSection }
    >('skill_tree', 'subsection', {
      main_section_id: mainSectionId,
      title: title,
      description: description,
    }).then(res =>
      deckDispatch({
        action: 'CREATE_SUB_SECTION',
        deckId: res.deckId,
        mainSectionId: res.mainSectionId,
        subSection: res.subsection,
      })
    );
  }

  return (
    <div className='text-right'>
      <ButtonGroup>
        <Button
          variant='secondary'
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Subsection
        </Button>
        <Modal show={isCreateModalOpen} onHide={() => setIsCreateModalOpen(false)}>
          <Modal.Header>
            <Modal.Title>
              Creating Subsection
            </Modal.Title>
          </Modal.Header>
          <AbstractSectionCreateForm callback={createSubSectionCallback} />
        </Modal>
      </ButtonGroup>
    </div>
  );
}
