import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import LoadingButton from './LoadingButton';
import { SharedDeck } from '../types';
import { backendFetch } from '../../../lookup/lookup';
import { Deck } from '../../types';

export default function CopySharedDeckButton({ sharedDeck }: { sharedDeck: SharedDeck }) {
  const [isOpen, setIsOpen] = useState(false);

  const cloneDeck = async () => {
    const deck = await backendFetch<Deck>('POST', `sharing_system/shareddeck/${sharedDeck.id}/clone/`, {
      title: (document.getElementsByName('title')[0] as HTMLFormElement).value,
    });

    window.location.href = `/deck/${deck.id}/`;
  }

  return (<>
    <Button style={{ width: '150px', marginLeft: '2px' }} onClick={() => setIsOpen(true)}>
      Copy
    </Button>
    <Modal show={isOpen} onHide={() => setIsOpen(false)}>
      <Modal.Header>
        <Modal.Title>Copying "{sharedDeck.title}"</Modal.Title>
      </Modal.Header>
      <Form name='createDeckForm'>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Deck Title</Form.Label>
            <Form.Control
              type='text'
              name='title'
              defaultValue={sharedDeck.title}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <LoadingButton
            clickFunc={cloneDeck}
            type='submit'
            block
          >
            Copy
          </LoadingButton>
        </Modal.Footer>
      </Form>
    </Modal>
  </>);
}