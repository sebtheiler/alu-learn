import React from 'react';
import { Deck } from '../../types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { apiObjectEdit } from '../../../lookup/lookup';  // TODO: improve imports


interface EditOptions {
  title?: string;
}
interface EditModalProps {
  deck: Deck;
  modalIsOpen: boolean;
  closeModal(): void;
}
export default function EditModal(props: EditModalProps) {
  const { deck, modalIsOpen, closeModal } = props;

  const editDeck = (options: EditOptions) => {
    // setDecks
    apiObjectEdit('decks', 'deck', deck.id, options);
  }

  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>Editing "{deck.title}"</Modal.Title>
      </Modal.Header>
      <Form onSubmit={e => {e.preventDefault(); closeModal();}}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Deck Title</Form.Label>
            <Form.Control
              type='text'
              name='deckTitle'
              onBlur={e => editDeck({ title: e.target.value })}
            />
          </Form.Group>
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
  )
}
