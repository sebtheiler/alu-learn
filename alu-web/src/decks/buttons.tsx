import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { Deck } from './types';
import { apiFlashcardEditTags, apiDeckJSONExport } from '../lookup';
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

export function SelectFlashcardsButtonGroup(props) {
  const {selectionMode, setSelectionMode, selectedFlashcards, setSelectedFlashcards, tagEditorModalIsOpen, setTagEditorModalIsOpen} = props;
  const [tagEditAction, setTagEditAction] = useState<'ADD' | 'REMOVE' | 'RENAME'>('ADD');
  const [updatingTags, setUpdatingTags] = useState(false);

  const editTags = event => {
    event.preventDefault();
    const form = event.target;

    if (!updatingTags) {
      setUpdatingTags(true);
      apiFlashcardEditTags(
        selectedFlashcards,
        tagEditAction,
        form.elements.tagValue.value,
        form.elements.renameTo?.value,
        (response, status) => {
          if (status === 200) {
            window.location.reload();
          } else {
            // Error updating flashcard tags in bulk
            errorHandler(response, status, 2006);
          }
          setUpdatingTags(false);
        },
      );
    }
  }

  return (
    <ButtonGroup className='mt-1'>
      <Button onClick={() => {setSelectionMode(!selectionMode); setSelectedFlashcards([])}}>
        {selectionMode ? 'Exit' : ''} Selection Mode
      </Button>
      {selectedFlashcards.length > 0 && <>
        <Button className='ml-1' onClick={() => setTagEditorModalIsOpen(true)}>
          Tag Editor
        </Button>
        <Modal show={tagEditorModalIsOpen} onHide={() => setTagEditorModalIsOpen(false)}>
          <Modal.Header>
            <Modal.Title>Editing Tags of {selectedFlashcards.length} Flashcards</Modal.Title>
          </Modal.Header>
          <Form onSubmit={editTags}>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Action</Form.Label>
                <Form.Control
                  as='select'
                  onChange={event => setTagEditAction(event.target.value as 'ADD' | 'REMOVE' | 'RENAME')}
                  custom
                >
                  <option value='ADD'>Add Tag to All Selected</option>
                  <option value='REMOVE'>Remove Tag from all Selected</option>
                  <option value='RENAME'>Rename Tag in all Selected</option>
                </Form.Control>
              </Form.Group>
              {tagEditAction === 'RENAME' && <p className='text-danger'>
                WARNING: "Rename" doesn't work perfectly.
                If you have the tag "carpet" and attempt to rename
                "car" to "vehicle", it will rename "carpet" to "vehiclepet."
              </p>}
              <Form.Group>
                <Form.Label>
                  Tag to {tagEditAction.charAt(0) + tagEditAction.slice(1).toLowerCase()}
                </Form.Label>
                <Form.Control type='text' name='tagValue' required />
              </Form.Group>
              {tagEditAction === 'RENAME' &&
                <Form.Group>
                  <Form.Label>
                    Rename to...
                  </Form.Label>
                  <Form.Control type='text' name='renameTo' required />
                </Form.Group>
              }
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setTagEditorModalIsOpen(false)}>
                Cancel
              </Button>
              <Button type='submit'>
                {updatingTags ? 'Updating...' : 'Update Tags'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </>}
    </ButtonGroup>
  );
}
