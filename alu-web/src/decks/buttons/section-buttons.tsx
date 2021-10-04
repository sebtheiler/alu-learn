import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import IconTooltip from './IconTooltip';
import LoadingButton from './LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { HomeActionDispatch } from '../context';
import { MainSection, SubSection } from '../types';
import { apiObjectCreate, apiObjectDelete, apiObjectEdit, apiObjectRearrange } from '../../lookup/lookup';
import { useContext, useState } from 'react';

export function MainSectionButtons({ mainSection, numMainSections }: { mainSection: MainSection, numMainSections: number }) {
  const { decksDispatch } = useContext(HomeActionDispatch);

  const renameMainSection = async () => {
    const title = window.prompt(
      `Renaming main section "${mainSection.data.title}"`
    ) ?? mainSection.data.title;
    if (title === mainSection.data.title || !decksDispatch) return;

    decksDispatch({
      action: 'EDIT_MAIN_SECTION',
      deckId: mainSection.deck,
      mainSectionId: mainSection.id,
      data: {
        title: title,
      },
    });
    await apiObjectEdit<MainSection>('skill_tree', 'mainsection', mainSection.id, {
      title: title,
    });
  }

  const deleteMainSection = async () => {
    if (!decksDispatch || !window.confirm('Are you sure you want to delete this main section?')) return;

    decksDispatch({
      action: 'DELETE_MAIN_SECTION',
      deckId: mainSection.deck,
      mainSectionId: mainSection.id,
    });
    await apiObjectDelete<MainSection>('skill_tree', 'mainsection', mainSection.id);
  }

  const moveMainSection = (direction: 'UP' | 'DOWN') => {
    return async () => {
      if (!decksDispatch) return;

      apiObjectRearrange('skill_tree', 'mainsection', mainSection.id, direction);
      decksDispatch({
        action: 'MOVE_MAIN_SECTION',
        deckId: mainSection.deck,
        mainSectionId: mainSection.id,
        mainSectionNum: mainSection.order_num,
        direction: direction,
      });
    }
  }

  return (
    <div className='main-section-buttons'>
      {mainSection.order_num !== 0 && <IconTooltip
        tooltip='Move main section up'
        onClick={moveMainSection('UP')}
        faClass='fas fa-caret-up'
        id={`move-up-main-section-tooltip-${mainSection.id}`}
      />}
      {mainSection.order_num !== numMainSections - 1 && <IconTooltip
        tooltip='Move main section down'
        onClick={moveMainSection('DOWN')}
        faClass='fas fa-caret-down ml-2'
        id={`move-down-main-section-tooltip-${mainSection.id}`}
      />}
      <IconTooltip
        tooltip='Edit main section title'
        onClick={renameMainSection}
        faClass='fas fa-pencil-alt ml-2'
        id={`edit-main-section-tooltip-${mainSection.id}`}
      />
      <IconTooltip
        tooltip='Delete main section'
        onClick={deleteMainSection}
        faClass='fas fa-trash-alt ml-2'
        id={`delete-main-section-tooltip-${mainSection.id}`}
      />
    </div>
  );
}

interface SubSectionButtonsProps {
  subSection: SubSection;
  mainSectionId: string;
  numSubSections: number;
  deckId: number;
}
export function SubSectionButtons({ subSection, numSubSections, mainSectionId, deckId }: SubSectionButtonsProps) {
  const { decksDispatch } = useContext(HomeActionDispatch);

  const renameSubSection = async () => {
    const title = window.prompt(
      `Renaming sub section "${subSection.data.title}"`
    ) ?? subSection.data.title;
    if (title === subSection.data.title || !decksDispatch) return;

    decksDispatch({
      action: 'EDIT_SUB_SECTION',
      deckId: deckId,
      mainSectionId: mainSectionId,
      subSectionId: subSection.id,
      data: {
        title: title,
      }
    });
    await apiObjectEdit<MainSection>('skill_tree', 'subsection', subSection.id, {
      title: title,
    });
  }

  const deleteSubSection = async () => {
    if (!decksDispatch || !window.confirm('Are you sure you want to delete this sub section?')) return;

    decksDispatch({
      action: 'DELETE_SUB_SECTION',
      deckId: deckId,
      mainSectionId: mainSectionId,
      subSectionId: subSection.id,
    });
    await apiObjectDelete<MainSection>('skill_tree', 'subsection', subSection.id);
  }

  const moveSubSection = (direction: 'UP' | 'DOWN') => {
    return async () => {
      if (!decksDispatch) return;

      apiObjectRearrange('skill_tree', 'subsection', subSection.id, direction);
      decksDispatch({
        action: 'MOVE_SUB_SECTION',
        deckId: deckId,
        mainSectionId: mainSectionId,
        subSectionId: subSection.id,
        subSectionNum: subSection.order_num,
        direction: direction,
      });
    }
  }
  
  return (
    <div className='sub-section-buttons'>
      <IconTooltip
        tooltip='Delete sub section'
        onClick={deleteSubSection}
        faClass='fas fa-trash-alt float-right ml-2'
        id={`delete-sub-section-tooltip-${subSection.id}`}
      />
      <IconTooltip
        tooltip='Edit sub section title'
        onClick={renameSubSection}
        faClass='fas fa-pencil-alt float-right ml-2'
        id={`edit-sub-section-tooltip-${subSection.id}`}
      />
      {subSection.order_num !== numSubSections - 1 && <IconTooltip
        tooltip='Move sub section right'
        onClick={moveSubSection('DOWN')}
        faClass='fas fa-caret-right float-right ml-2'
        id={`move-down-sub-section-tooltip-${subSection.id}`}
      />}
      {subSection.order_num !== 0 && <IconTooltip
        tooltip='Move sub section left'
        onClick={moveSubSection('UP')}
        faClass='fas fa-caret-left float-right ml-2'
        id={`move-up-sub-section-tooltip-${subSection.id}`}
      />}
    </div>
  );
}

function AbstractSectionCreateForm({ callback }: { callback(title: string, description: string): Promise<void> }) {
  return (
    <Form onSubmit={e => e.preventDefault()}>
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
  const { decksDispatch } = useContext(HomeActionDispatch);

  const createMainSectionCallback = async (title: string, description: string) => {
    if (!decksDispatch) return;
    await apiObjectCreate<MainSection>('skill_tree', 'mainsection', {
      deck_id: deckId,
      title: title,
      description: description,
    }).then(res =>
      decksDispatch({
        action: 'CREATE_MAIN_SECTION',
        deckId: res.deck,
        mainSection: res,
      })
    ).then(() => setIsCreateModalOpen(false));
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

export function CreateSubSectionButton({ mainSection }: { mainSection: MainSection }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { decksDispatch } = useContext(HomeActionDispatch);

  const createSubSectionCallback = async (title: string, description: string) => {
    if (!decksDispatch) return;
    await apiObjectCreate<SubSection>('skill_tree', 'subsection', {
      main_section_id: mainSection.id,
      title: title,
      description: description,
    }).then(res =>
      decksDispatch({
        action: 'CREATE_SUB_SECTION',
        deckId: mainSection.deck,
        mainSectionId: mainSection.id,
        subSection: res,
      })
    ).then(() => setIsCreateModalOpen(false));
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
