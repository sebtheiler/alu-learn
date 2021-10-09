import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';
import { Deck } from '../../decks/types';
import { useObjectList } from '../../lookup/lookup';
import { useState } from 'react';

interface AttachDeckModalProps {
  show: boolean;
  close(): void;
  callback(deck: Deck): void;
}
export default function AttachDeckModal({ show, close, callback }: AttachDeckModalProps) {
  const [decks] = useObjectList<Deck>('decks', 'deck');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Modal show={show} onHide={close}>
      <Modal.Header>
        <Modal.Title className='w-100'>
          Attaching deck
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {decks ? decks.map(deck =>
          <p
            className='searched-item text-center'
            onClick={() => {setIsLoading(true); callback(deck)}}
            role='button'
            key={deck.id}
          >
            {deck.title}
          </p>
        ) : <p>Loading…</p>}
        {decks?.length === 0 && <p>You don't have any decks yet.  Please create one first, using the other button.</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={close}>
          {isLoading
            ? <>Attach <Spinner animation='border' size='sm' /></>
            : 'Cancel'
          }
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
