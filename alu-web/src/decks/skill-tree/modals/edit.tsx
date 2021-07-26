import React, { useContext } from 'react';
import { Deck } from '../../types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { apiObjectEdit } from '../../../lookup/lookup';  // TODO: improve imports
import { DeckDispatch } from '../context';


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
  const deckDispatch = useContext(DeckDispatch);

  const editDeck = (options: DeckEditableAttrs) => {
    apiObjectEdit('decks', 'deck', deck.id, options);
    if (deckDispatch)
      deckDispatch({ action: 'EDIT', payload: { id: deck.id, ...options } });
  }

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header>
        <Modal.Title>Editing "{deck.title}"</Modal.Title>
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
