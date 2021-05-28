import React, { ReactNode, ReactNodeArray, useState } from 'react';
import { apiDeckDelete, apiDeckEdit, apiSharedDeckClone, apiSSMEdit, apiSSMDelete, apiDeckPrivateList, apiFlashcardEditTags, apiClassroomGetSSM, apiClassroomEditSSM, apiDeckJSONExport } from '../lookup';
import { errorHandler, FormCheckbox, has, LoadingButton, QuestionBubble, useApiObjectHook } from '../utils';
import { SearchForm } from './flashcards/search';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Deck, SharedDeck, CSSM, SSMInterface } from './types';


// Buttons for when an owner views their deck
interface DeckDefaultButtonGroupProps {
  deck: Deck | CSSM | SharedDeck;
  vertical?: boolean;
  hideBrowse?: boolean;
}
export function DeckDefaultButtonGroup(props: DeckDefaultButtonGroupProps) {
  const { deck, vertical=false, hideBrowse=false } = props;
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [gameModalIsOpen, setGameModalIsOpen] = useState(false);
  const [exportModalIsOpen, setExportModalIsOpen] = useState(false);

  const openEditModal = () => setEditModalIsOpen(true);
  const closeEditModal = () => setEditModalIsOpen(false);
  const openGameModal = () => setGameModalIsOpen(true);
  const closeGameModal = () => setGameModalIsOpen(false);
  const openExportModal = () => setExportModalIsOpen(true);
  const closeExportModal = () => setExportModalIsOpen(false);

  const gameSubmitHandler = event => {
    event.preventDefault();
    const form = event.target;
    let gameOptions = '';
    gameOptions += `game=${form.elements.gameType.value}`;
    gameOptions += `&flashcards=${form.elements.flashcardType.value}`;
    if (form.elements.flashcardType.value === 'TAG') {
      gameOptions += `&tag=${form.elements.tagToSearch.value}`;
    }
    switch (form.elements.gameType.value) {
      case 'MATCHING':
        gameOptions += `&size=${form.elements.size.value}`;
        break;
      case 'QUIZ':
      case 'CRAM':
        gameOptions += `&num=${form.elements.num.value}`;
        break;
      default:
        break;
    }
    gameOptions += `&random=${form.elements.randomOrder?.checked}`;

    window.location.href = `/decks/${deck.id}/game/?${gameOptions}`;
  }

  const saveHandler = event => {
    event.preventDefault();
    const form = event.target;

    // If nothing has changed, prevent the user from saving
    if (
        deck.serializer_name === 'deck' &&
        form.elements.title.value === deck.title &&
        (form.elements.schedulingAlgo?.value ?? deck.scheduling_algorithm) === deck.scheduling_algorithm &&
        (form.elements.shuffleUnseenCards?.checked ?? deck.shuffle_unseen_cards) === deck.shuffle_unseen_cards &&
        parseInt(form.elements.dailyNewCardLimit.value) === deck.daily_new_card_limit &&
        parseInt(form.elements.dailySeenCardLimit.value) === deck.daily_seen_card_limit &&
        (parseInt(form.reviewAheadMinutes?.value ?? deck.review_ahead_minutes)) === deck.review_ahead_minutes &&
        form.elements.deckDifficulty.value === deck.difficulty
    ) {
      return;
    }

    // Tell the API to update the deck/CSSM
    if (deck.serializer_name === 'deck') {
      apiDeckEdit(
        deck.id,
        form.elements.title.value,
        form.elements.schedulingAlgo?.value,
        form.elements.shuffleUnseenCards?.checked,
        parseInt(form.elements.dailyNewCardLimit.value),
        parseInt(form.elements.dailySeenCardLimit.value),
        parseInt(form.elements.reviewAheadMinutes?.value),
        form.elements.deckDifficulty.value,
        (response, status) => {
          if (status === 200) {
            window.location.reload();
          } else {
            // Error updating deck
            errorHandler(response, status, 1000);
          }
      });
    } else if (deck.serializer_name === 'cssm' && has(deck, 'deck_ids')) {
      const deckSelectElement = form.elements.deckSelect;
      const selectedDecks = deckSelectElement ? Array.from(
        deckSelectElement.querySelectorAll("option:checked"),
        e => parseInt((e as HTMLOptionElement).value),
      ) : undefined;

      apiSSMEdit(
        deck.id,
        form.elements.title.value,
        form.elements.schedulingAlgo?.value,
        form.elements.shuffleUnseenCards?.checked,
        parseInt(form.dailyNewCardLimit.value),
        parseInt(form.dailySeenCardLimit.value),
        parseInt(form.reviewAheadMinutes?.value),
        selectedDecks,
        form.elements.tags?.value,
        form.elements.contains?.value,
        form.elements.isLeech?.value !== 'ANY' ? form.elements.isLeech?.value === 'LEECH' : null,
        form.elements.learningStatus?.value !== 'ANY' ? form.elements.learningStatus?.value : null,
        parseInt(form.elements.minEase?.value),
        parseInt(form.elements.maxEase?.value),
        (response, status) => {
          if (status === 200) {
            window.location.reload();
          } else {
            // Error updating CSSM
            errorHandler(response, status, 5003);
          }
        },
      );
    }
  }

  const deleteHandler = () => {
    if (deck.serializer_name === 'deck') {
      if (window.prompt(`
Are you sure you want to delete this deck?  This action is instant and irreversible.
If you wish to continue, please type "DELETE", without the quotes.
      `) === 'DELETE') {
        apiDeckDelete(deck.id, (response, status) => {
          if (status === 200) {
            window.location.href = '/home/decks/';
          } else {
            // Error deleting deck
            errorHandler(response, status, 1001);
          }
        });
      }
    } else {
      apiSSMDelete(deck.id, (response, status) => {
        if (status === 200) {
          window.location.href = '/home/decks/';
        } else {
          // Error deleting SSM
          errorHandler(response, status, 5004);
        }
      });
    }
  }

  return (
    <ButtonGroup vertical={vertical} style={vertical ? {display: 'block', margin: '0 auto', textAlign: 'center', width: '50%'} : {}}>
      <Button
        href={deck.serializer_name === 'deck' ?
        `/decks/${deck.id}/study/` :
        `/customstudy/${deck.id}/study/`}
        className='study-btn mr-1'
      >
        Study
      </Button>
      {deck.serializer_name === 'deck' &&
        <Button href={`/decks/${deck.id}/flashcards/create/`} className='add-cards-btn mr-1'>
          Add Cards
        </Button>
      }
      <DropdownButton
        title='Other'
        className='other-btn mr-1'
        as={ButtonGroup}
        id='bg-nested-dropdown'
        variant='secondary'
      >
        <Dropdown.Item
          as='button'
          onClick={openEditModal}
          className='edit-btn w-100'
        >
          Edit
        </Dropdown.Item>
        <DeckEditCreateModal
          deck={deck}
          modalIsOpen={editModalIsOpen}
          closeModal={closeEditModal}
          submitHandler={saveHandler}
          deleteHandler={deleteHandler}
        />
        {(!hideBrowse && deck.serializer_name === 'deck') &&
          <Dropdown.Item
            href={`/decks/${deck.id}/flashcards/`}
            className='browse-btn w-100'
          >
            Browse
          </Dropdown.Item>
        }
        <Dropdown.Divider />
        <Dropdown.Item
          onClick={openGameModal}
          className='games-btn w-100'
        >
          Games
        </Dropdown.Item>
        <GameModal
          deck={deck}
          modalIsOpen={gameModalIsOpen}
          closeModal={closeGameModal}
          submitHandler={gameSubmitHandler}
        />
        <Dropdown.Item
          href={`/decks/${deck.id}/stats/`}
          className='stats-btn w-100'
        >
          Statistics
        </Dropdown.Item>
        {deck.serializer_name === 'deck' && <>
          <Dropdown.Item
            onClick={openExportModal}
            className='export-btn w-100'
          >
            Export
          </Dropdown.Item>
          <ExportModal
            deck={deck}
            modalIsOpen={exportModalIsOpen}
            closeModal={closeExportModal}
          />
        </>}
      </DropdownButton>
    </ButtonGroup>
  );
}

// Modal pop-up for when the 'Edit' button is pressed
interface DeckEditCreateModalProps {
  deck?: Deck | CSSM;
  modalIsOpen: boolean;
  submitHandler(event): void;
  deleteHandler?(event): void;
  closeModal(): void;
}
export function DeckEditCreateModal(props: DeckEditCreateModalProps) {
  const { deck, modalIsOpen, closeModal, submitHandler, deleteHandler } = props;

  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>
          {!!deck ?
            <>Edit "{deck.title}"</>
            :
            <>Creating deck</>
          }
        </Modal.Title>
      </Modal.Header>
      {!deck &&
        <DeckEditCreateForm
          mode='create'
          submitHandler={submitHandler}
          closeModal={closeModal}
        />
      }
      {deck?.serializer_name === 'deck' &&
        <DeckEditCreateForm
          deck={deck}
          mode='edit'
          submitHandler={submitHandler}
          deleteHandler={deleteHandler}
          closeModal={closeModal}
        />
      }
      {deck?.serializer_name === 'cssm' &&
        <CSSMEditForm
          cssm={deck as CSSM}
          submitHandler={submitHandler}
          deleteHandler={deleteHandler}
          closeModal={closeModal}
        />
      }
    </Modal>
  );
}


interface DeckLikeEditCreateFormProps {
  deckLike?: Deck | CSSM | SSMInterface;
  mode: 'edit' | 'create';
  submitHandler(event): void;
  deleteHandler?(event): void;
  closeModal(): void;
  children?: ReactNode | ReactNodeArray;
  options?: { disableTitle?: boolean };
}
function DeckishEditCreateForm(props: DeckLikeEditCreateFormProps) {
  const { deckLike, mode, submitHandler, deleteHandler, closeModal } = props;
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  return (
    <Form onSubmit={submitHandler}>
      <Modal.Body>
        {((deckLike && has(deckLike, 'title')) || !deckLike) && <Form.Group>
          <Form.Label htmlFor='title'>Title</Form.Label>
          <Form.Control
            type='text'
            placeholder='My deck'
            name='title'
            defaultValue={deckLike?.title}
            required
          />
        </Form.Group>}
        {props.children}
        <Form.Group>
          <Form.Label htmlFor='deckDifficulty'>
            Difficulty{' '}
            <QuestionBubble>
              This option controls how spread apart reviews will be.
              Simpler difficulties will give you longer intervals between flashcard reviews, giving you less work.
              Please be aware that although simpler difficulties are easier, they will also result in worse memories.
            </QuestionBubble>
          </Form.Label>
          <Form.Control
            as='select'
            name='deckDifficulty'
            defaultValue={deckLike?.difficulty}
            custom
          >
            <option value='HARD'>Memorize Everything (Recommended)</option>
            <option value='NORM'>Memorize Most Things</option>
            <option value='EASY'>Get the Overview</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor='dailyNewCardLimit'>
            New Cards Per Day{' '}
            <QuestionBubble>
              This is the number of NEW flashcards you will see every day.
              If you are being overwhelmed you might want to consider decreasing it.
            </QuestionBubble>
          </Form.Label>
          <Form.Control
            type='number'
            name='dailyNewCardLimit'
            defaultValue={deckLike?.daily_new_card_limit ?? 20}
            min='0'
            max='9999'
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor='dailySeenCardLimit'>
            Max Seen Cards Per Day{' '}
            <QuestionBubble>
              This is maximum number of OLD reviews you will see every day.
              If you are being overwhelmed you might want to consider decreasing it.
            </QuestionBubble>
          </Form.Label>
          <Form.Control
            type='number'
            name='dailySeenCardLimit'
            defaultValue={deckLike?.daily_seen_card_limit ?? 200}
            min='0'
            max='9999'
            required
          />
        </Form.Group>
        <div className='text-center d-flex'>
          <hr className='flex-grow-1' />
          <span className='px-2 align-self-center'>
            <Button
              className='mb-3'
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              id='toggle-advanced-options'
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
            </Button>
          </span>
          <hr className='flex-grow-1' />
        </div>
        {showAdvancedOptions && <>
          <Form.Group>
            <FormCheckbox
              name='shuffleUnseenCards'
              defaultChecked={deckLike?.shuffle_unseen_cards}
            >
              Shuffle Unseen Cards{' '}
              <QuestionBubble>
                If checked, this will make it so that the order flashcards are displayed to you in this deck is random, rather than being from the beginning of the deck and slowly to the end.
                You don't want this enabled for most unit-based decks, but if your deck is alphabetically ordered you should definitely enable it.
              </QuestionBubble>
            </FormCheckbox>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='reviewAheadMinutes'>
              Review Ahead Minutes{' '}
              <QuestionBubble>
                Alu shows you flashcards within this value of minutes right now instead of making you wait a couple minutes.  This is relevant when the flashcard interval is in minutes, so that you don't have to wait multiple minutes to review flashcards.
              </QuestionBubble>
            </Form.Label>
            <Form.Control
              type='number'
              name='reviewAheadMinutes'
              defaultValue={deckLike?.review_ahead_minutes ? deckLike?.review_ahead_minutes : 120}
              min='0'
              max='5000000'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='schedulingAlgo'>
              Scheduling Algorithm{' '}
              <QuestionBubble>
                Alu uses a certain algorithm to determine when you should next see flashcards.  You can change that specific algorithm here.
              </QuestionBubble>
            </Form.Label>
            <Form.Control
              as='select'
              name='schedulingAlgo'
              defaultValue={deckLike?.scheduling_algorithm}
              custom
            >
              <option value='ANKING'>Optimized Anki Settings</option>
              <option value='ANKI'>Default Anki Settings</option>
            </Form.Control>
          </Form.Group>
        </>}
      </Modal.Body>
      <Modal.Footer>
        {deckLike && has(deckLike, 'serializer_name') &&
          <Button
            onClick={deleteHandler}
            variant='danger'
            className='text-left mr-auto'
          >
            Delete {deckLike.serializer_name === 'deck' ? 'Deck' : 'Custom Study'}
          </Button>
        }
        <Button onClick={closeModal} variant='secondary'>
          Cancel
        </Button>
        <Button type='submit' id='edit-create-deck'>
          {mode === 'edit' ? 'Save' : 'Create'}
        </Button>
      </Modal.Footer>
    </Form>
  );
}


interface DeckEditCreateFormProps {
  deck?: Deck;
  mode: 'edit' | 'create';
  submitHandler(event): void;
  deleteHandler?(event): void;
  closeModal(): void;
}
export function DeckEditCreateForm(props: DeckEditCreateFormProps) {
  const { deck, mode, submitHandler, deleteHandler, closeModal } = props;

  return (
    <DeckishEditCreateForm
      deckLike={deck}
      mode={mode}
      submitHandler={submitHandler}
      deleteHandler={deleteHandler}
      closeModal={closeModal}
    >
      {!!deck &&
        <ButtonGroup className='w-100 mb-2'>
          <Button href={`/decks/${deck.id}/get-updates/`} className='float-right update-btn'>
            Check for Updates
          </Button>
          <span className='mx-1' />
          <Button href={`/decks/${deck.id}/share/`} className='float-left make-public-btn'>
            Make Deck Public
          </Button>
        </ButtonGroup>
      }
    </DeckishEditCreateForm>
  );
}

interface CSSMEditFormProps {
  cssm: CSSM;
  submitHandler(event): void;
  deleteHandler?(event): void;
  closeModal(): void;
}
export function CSSMEditForm(props: CSSMEditFormProps) {
  const { cssm, submitHandler, deleteHandler, closeModal } = props;
  const [showSearchSettings, setShowSearchSettings] = useState(false);
  const [decks] = useApiObjectHook<Deck[]>(
    apiDeckPrivateList,
    200,
    1026,
    [], null, null,
    showSearchSettings,
  );

  return (
    <DeckishEditCreateForm
      deckLike={cssm}
      mode='edit'
      submitHandler={submitHandler}
      deleteHandler={deleteHandler}
      closeModal={closeModal}
    >
      <Button
        onClick={() => setShowSearchSettings(!showSearchSettings)}
        className='mb-3 w-100'
      >
        {`${showSearchSettings ? 'Hide' : 'Show'} Search Settings`}
      </Button>
      {showSearchSettings && decks &&
        <SearchForm
          decks={decks}
          defaultContains={cssm.contains}
          defaultTags={cssm.tags}
          defaultLeech={cssm.leech === true ? 'LEECH' : (cssm.leech === false ? 'NOTLEECH' : undefined)}
          defaultLearningStatus={cssm.learning_status}
          defaultMinEase={cssm.min_ease}
          defaultMaxEase={cssm.max_ease}
          defaultSelectedDecks={cssm?.deck_ids?.split(',')}
          hideSuspend
        />
      }
    </DeckishEditCreateForm>
  );
}


interface ClassroomSSMEditFormProps {
  classroomId: number;
  closeModal(): void;
}
export function ClassroomSSMEditForm(props: ClassroomSSMEditFormProps) {
  const { classroomId, closeModal } = props;
  const [SSM] = useApiObjectHook<SSMInterface>(
    apiClassroomGetSSM,
    200,
    8022,
    [classroomId],
    null, null,
    !!classroomId,
  );
  if (!SSM) return <p>Loading...</p>

  const editClassroomSSM = event => {
    // Edits the classroom deck's SSM, as well as
    // all of the ASSMs for the various assignments in that class
    event.preventDefault();
    const form = event.target;

    apiClassroomEditSSM(
      classroomId,
      form.elements.schedulingAlgo?.value,
      form.elements.shuffleUnseenCards?.checked,
      form.elements.dailyNewCardLimit.value,
      form.elements.dailySeenCardLimit.value,
      form.elements.reviewAheadMinutes?.value,
      (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          errorHandler(response, status, 8023);
        }
      },
    );
  }

  return (
    <DeckishEditCreateForm
      deckLike={SSM}
      mode='edit'
      submitHandler={editClassroomSSM}
      closeModal={closeModal}
    />
  );
}

// Buttons displayed when a user that does not own the deck views a deck
export function DeckForeignUserButtonGroup({ deck, hideCopy=false }) {
  const [copyLoading, setCopyLoading] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  const handleCopyDeck = (event) => {
    event.preventDefault();
    const form = event.target;

    if (copyLoading === false) {
      setCopyLoading(true);
      apiSharedDeckClone(deck.id, form.elements.destinationTitle.value, (response, status) => {
        if (status === 200) {
          window.location.href = `/decks/${response.id}/flashcards/`;
        } else if (response.message === 'You have already cloned this deck') {
          const errorMsg = document.getElementById('clone-error');
          if (errorMsg)
            errorMsg.innerHTML = "You have already cloned this deck.  Please check your <a href='/home/decks/'>decks homepage</a> to see it.";
        } else {
          // Error copying deck
          errorHandler(response, status, 1002)
        }
        setCopyLoading(false);
      });
    }
  }

  return (
    <div className='text-center'>
      <ButtonGroup>
        {!hideCopy && <>
          <Button onClick={() => setShowCopyModal(true)} id='copy-deck-btn'>
            Copy Deck 
          </Button>
          <Modal show={showCopyModal} onHide={() => setShowCopyModal(false)}>
            <Modal.Header>
              <Modal.Title>Copying "{deck.title}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleCopyDeck}>
              <Modal.Body>
                <Form.Label>Destination</Form.Label>
                <p className='text-danger' id='clone-error' />
                <Form.Control
                  type='text'
                  defaultValue={deck.title}
                  name='destinationTitle'
                  required
                />
              </Modal.Body>
              <Modal.Footer>
                <Button type='submit' id='copy-deck-submit-btn'>
                  {copyLoading ? 'Copying...' : 'Copy Deck'}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </>}
        <Button href={`/decks/${deck.id}/flashcards/`} className='ml-1' id='flashcards-btn'>
          View Flashcards
        </Button>
      </ButtonGroup>
    </div>
  );
}


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
export function GameModal({ modalIsOpen, closeModal, submitHandler, deck }) {
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
              <option value='CRAM'>Cram</option>
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


interface DefaultSharedDeckButtonsProps {
  deck: SharedDeck;
  hideUpdateSettings?: boolean;
}
export function DefaultSharedDeckButtons(props: DefaultSharedDeckButtonsProps) {
  const { deck, hideUpdateSettings } = props;
  return (
    <ButtonGroup>
      {!hideUpdateSettings && <Button href={`/decks/${deck.creators[0]}/share/`}>
        Update Settings
      </Button>}
      <Button href={`/decks/${deck.creators[0]}/share/push/`} className='ml-1'>
        Push Changes
      </Button>
      <Button href={`/decks/${deck.id}/flashcards/`} className='ml-1'>
        View Flashcards
      </Button>
    </ButtonGroup> 
  );
}
