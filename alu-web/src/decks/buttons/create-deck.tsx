import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import LoadingButton from '../buttons/LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { Deck } from '../types';
import { DeckEditableAttrs, DeckForm } from '../modals/edit';
import { HomeActionDispatch } from '../context';
import { QuestionBubble } from '../../utils';
import { apiObjectCreate } from '../../lookup/lookup';
import { useContext, useState  } from 'react';
import TutorialPopup from '../../pages/tutorial';

export default function CreateDeckButton() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDeck, setCreateDeck] = useState<Element | null>(null)

  return (<>
    <div className='deck-selection-item mb-5'>
      <div
        className='deck-selection-main mb-0'
        role='button'
        onClick={() => setShowCreateModal(true)}
        ref={setCreateDeck}
      >
        <p>
          <span className='title-text'>Create New Deck</span>
          <span><i className='fas fa-plus fa-2x float-left mt-2 ml-2' /></span>
        </p>
      </div>
    </div>
    <CreateDeckModal
      show={showCreateModal}
      close={() => setShowCreateModal(false)}
    />
    <TutorialPopup referenceElement={createDeck} tutorialAttr={'created_first_deck'}>
      Click here to create your first deck
    </TutorialPopup>
  </>);
}



const editableAttrs = ['title'];
interface CreateModalProps {
  show: boolean;
  close(): void;
  callback?(deck: Deck): Promise<void>;
}
export function CreateDeckModal({ show, close, callback }: CreateModalProps) {
  const { decksDispatch } = useContext(HomeActionDispatch);

  const createDeck = async (options: DeckEditableAttrs) => {
    await apiObjectCreate<Deck>('decks', 'deck', options).then(
      res => {
        if (decksDispatch)
          decksDispatch({
            action: 'CREATE',
            payload: res,
          });

        if (callback)
          callback(res);
      }
    );

    close();
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header>
        <Modal.Title className='w-100'>
          Creating deck
          <Button className='float-right' href='/deck/import/'>
            Import{' '}
            <QuestionBubble isWhite>
              Import flashcards from another program (like Anki or Quizlet)
            </QuestionBubble>
          </Button>
        </Modal.Title>
      </Modal.Header>
      <Form name='createDeckForm'>
        <Modal.Body>
          <DeckForm />
        </Modal.Body>
        <Modal.Footer>
          <LoadingButton
            clickFunc={async () => {
              const form = document.getElementsByName('createDeckForm')[0] as HTMLFormElement;
              if (!form) return;

              let createDeckOptions = {};
              for (const el of form.elements) {
                let elName = (el as any).name;
                if (editableAttrs.includes(elName))
                  createDeckOptions[elName] = (el as any).value;
              }

              await createDeck(createDeckOptions);
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