import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import LoadingButton from './LoadingButton';
import Modal from 'react-bootstrap/Modal';
import { Deck } from '../types';
import { SharedDeck } from '../types';
import { backendFetch } from '../../lookup/lookup';
import { useState } from 'react';
import TutorialPopup from '../../pages/tutorial';

interface CopySharedDeckButtonProps {
  sharedDeck: SharedDeck;
  isLoggedIn: boolean;
}
export default function CopySharedDeckButton({ sharedDeck, isLoggedIn }: CopySharedDeckButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copyBtn, setCopyBtn] = useState<Element | null>(null);

  const cloneDeck = async () => {
    const deck = await backendFetch<Deck>('POST', `sharing_system/shareddeck/${sharedDeck.id}/copy/`, {
      title: (document.getElementsByName('title')[0] as HTMLFormElement).value,
    });

    window.location.href = `/deck/${deck.id}/`;
  }

  return (<>
    <Button
      onClick={() => setIsOpen(true)}
      disabled={!isLoggedIn}
      className='w-100'
      ref={setCopyBtn}
    >
      Copy {!isLoggedIn && <a href='/login/' className='text-white'>(Log-in)</a>}
    </Button>
    {isLoggedIn && <TutorialPopup
      referenceElement={copyBtn}
      tutorialAttr='copied_shared_deck'
      placement='top'
    >
      Click here to copy the deck
    </TutorialPopup>}

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
            // TODO: add `type='submit'` to more LoadingButtons
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