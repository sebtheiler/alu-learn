import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import LoadingButton from '../buttons/LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { ButtonGroup } from 'react-bootstrap';
import { Deck } from '../types';
import { HomeActionDispatch } from '../context';
import { apiObjectDelete, apiObjectEdit, backendFetch } from '../../lookup/lookup';  // TODO: improve imports
import { confirmDelete, QuestionBubble } from '../../utils/utils';
import { useContext } from 'react';


export interface DeckEditableAttrs {
  title?: string;
}
interface EditModalProps {
  deck: Deck;
  show: boolean;
  close(): void;
}
export default function EditModal(props: EditModalProps) {
  const { deck, show, close } = props;
  const { decksDispatch } = useContext(HomeActionDispatch);

  const editDeck = (options: DeckEditableAttrs) => {
    apiObjectEdit('decks', 'deck', deck.id, options);
    if (decksDispatch)
      decksDispatch({ action: 'EDIT', payload: { id: deck.id, ...options } });
  }

  const deleteDeck = async () => {
    if (!confirmDelete('deck')) return;
    await apiObjectDelete('decks', 'deck', deck.id);

    if (decksDispatch)
      decksDispatch({ action: 'DELETE', payload: deck.id});
    close();
  }

  const archiveDeck = async () => {
    await backendFetch('POST', `decks/deck/${deck.id}/archive/`, { is_archived: !deck.is_archived });
    window.location.href = deck.is_archived ? '/home/' : '/profiles/archived/';
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header>
        <Modal.Title>
          Editing "{deck.title}"
        </Modal.Title>
        <ButtonGroup>
          <LoadingButton
            className='float-right mr-1'
            variant='secondary'
            clickFunc={archiveDeck}
          >
            {deck.is_archived ? 'Unarchive' : 'Archive'}{' '}
            <QuestionBubble isWhite>
              Archiving decks allows you to hide decks you are no longer using.
              They will still be accessible through your <a href='/profile/'>profile page</a>.
            </QuestionBubble>
          </LoadingButton>
          <LoadingButton
            className='float-right'
            variant='danger'
            clickFunc={deleteDeck}
          >
            Delete
          </LoadingButton>
        </ButtonGroup>
      </Modal.Header>
      <Form onSubmit={e => {e.preventDefault(); close();}}>
        <Modal.Body>
          <DeckForm
            deck={deck}
            editDeck={editDeck}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            type='submit'
            variant='secondary'
            block
          >
            Close
          </Button>
          <small className='text-secondary mx-auto'>
            Changes are auto-saved
          </small>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

interface DeckFormProps {
  deck?: Deck;
  editDeck?(options: DeckEditableAttrs): void;
}
export function DeckForm(props: DeckFormProps) {
  const { deck, editDeck } = props;

  return (
    <Form.Group>
      <Form.Label>Deck Title</Form.Label>
      <Form.Control
        type='text'
        name='title'
        onBlur={editDeck ? e => editDeck({ title: e.target.value }) : undefined}
        defaultValue={deck?.title}
        required
      />
    </Form.Group>
  );
}
