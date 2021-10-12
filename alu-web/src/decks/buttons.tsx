import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { Deck } from './types';
import { apiDeckJSONExport } from '../lookup';
import { errorHandler, FormCheckbox, LoadingButton, QuestionBubble } from '../utils';
import { useState } from 'react';

interface ExportModalProps {
  modalIsOpen: boolean;
  closeModal: () => void;
  deck: Deck;
}
export function ExportModal(props: ExportModalProps) {
  const { modalIsOpen, closeModal, deck } = props;
  const [exportType, setExportType] = useState<'JSON' | 'TXT'>('JSON');

  const submitHandler = event => {
    event.preventDefault();
    if (exportType === 'TXT') return;
    
    const form = event.target;
    apiDeckJSONExport(deck.id, form.elements.exportReviewInstances?.checked, (response, status) => {
      if (status === 200) {
        // Adapted from https://stackoverflow.com/a/18197341/13042142
        const element = document.createElement('a');
        element.setAttribute(
          'href',
          'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(response)),
        );
        element.setAttribute('download', `${deck.title}.json`);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);

        // After downloading the file, close the modal
        closeModal();
      } else {
        errorHandler(response, status, 1030);
      }
    });
  }

  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>
          Export "{deck.title}"
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={submitHandler}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              Type of Export
            </Form.Label>
            <Form.Control
              as='select'
              name='exportType'
              onChange={event => setExportType(event.target.value as ('JSON' | 'TXT'))}
              custom
            >
              <option value='JSON'>Export to *.json</option>
              <option value='TXT'>Export to *.txt</option>
            </Form.Control>
          </Form.Group>
          {exportType === 'JSON' &&
            <FormCheckbox name='exportReviewInstances' defaultChecked>
              Would you like to export your current flashcard progress as well?{' '}
              <QuestionBubble>
                If checked, this export will also contain your current progress (the flashcards you've studied) which you can import.  If you are sharing this deck with a friend you should probably NOT check this option.  If you plan to import the deck again for yourself, you probably SHOULD check this option.
              </QuestionBubble>
            </FormCheckbox>
          }
          {exportType === 'TXT' && <p>
            Sorry, but exports to *.txt aren't actually implemented yet.  If you really need it let me know and I'll add it for you.
          </p>}
        </Modal.Body>
        <Modal.Footer>
          <LoadingButton loadingMessage='Exporting...' type='submit' block>
            Export
          </LoadingButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

// Modal for selecting a game to play
interface GameModalProps {
  deck: Deck;
  modalIsOpen: boolean;
  closeModal(): void;
  submitHandler(event): void;
};
export function GameModal(props: GameModalProps) {
  const { modalIsOpen, closeModal, submitHandler, deck } = props;
  const [gameType, setGameType] = useState('MATCHING');
  const [flashcardType, setFlashcardType] = useState('SEEN');

  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>Play a Game with "{deck.title}"</Modal.Title>
      </Modal.Header>
      <Form onSubmit={submitHandler}>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Type of Game</Form.Label>
            <Form.Control
              as='select'
              name='gameType'
              onChange={event => setGameType(event.target.value)}
              custom
            >
              <option value='MATCHING'>Matching</option>
              {/* <option value='GRAVITY'>Gravity</option> */}
              <option value='QUIZ'>Quiz</option>
              {/* <option value='CRAM'>Cram</option> */}
              {/* <option value='FOREHEAD'>Forehead/Charades</option> */}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Type of Flashcards</Form.Label>
            <Form.Control
              as='select'
              name='flashcardType'
              id='flashcardType'
              onChange={event => setFlashcardType(event.target.value)}
              custom
            >
              <option value='SEEN'>Seen Flashcards (review old material)</option>
              <option value='UNSEEN'>Unseen Flashcards (preview new material)</option>
              <option value='ALL'>All Flashcards</option>
              <option value='TAG'>Filter by Tag (review specific unit)</option>
              <option value='PERSONAL'>Personalized (flashcards you struggle with most)</option>
            </Form.Control>
          </Form.Group>
          {flashcardType === 'TAG' && <Form.Group>
            <Form.Label>Tag to Search</Form.Label>
            <Form.Control type='text' name='tagToSearch' />
          </Form.Group>}
          {gameType === 'MATCHING' && <Form.Group>
            <Form.Label>Size</Form.Label>
            <Form.Control
              type='number'
              name='size'
              min={2}
              max={8}
              step={2}
              defaultValue={4}
            />
          </Form.Group>}
          {gameType === 'QUIZ' && <Form.Group>
            <Form.Label>Number of Questions</Form.Label>
            <Form.Control
              type='number'
              name='num'
              min={5}
              max={50}
              defaultValue={10}
            />
          </Form.Group>}
          {gameType === 'CRAM' && <Form.Group>
            <Form.Label>Maximum Number of Flashcards</Form.Label>
            <Form.Control
              type='number'
              name='num'
              min={10} max={9999}
              step={10}
              defaultValue={200}
            />
          </Form.Group>}
          {flashcardType !== 'PERSONAL' && <Form.Group>
            <FormCheckbox name='randomOrder' defaultChecked>
              Randomize flashcard order
            </FormCheckbox>
          </Form.Group>}
        </Modal.Body>
        <Modal.Footer>
          <Button type='submit' block>Play!</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
