import React, { useState } from 'react';
import { apiDeckDelete, apiDeckEdit, apiSharedDeckClone, apiSSMEdit, apiSSMDelete, apiDeckPrivateList, apiFlashcardEditTags } from '../lookup';
import { errorHandler, FormCheckbox, useApiObjectHook } from '../utils';
import { SearchForm } from './flashcards/search';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Deck, SharedDeck } from './types';


// Buttons for when an owner views their deck
export function DeckDefaultButtonGroup({ deck, vertical=false, hideBrowse=false }) {
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [gameModalIsOpen, setGameModalIsOpen] = useState(false);

  const openEditModal = () => setEditModalIsOpen(true);
  const closeEditModal = () => setEditModalIsOpen(false);
  const openGameModal = () => setGameModalIsOpen(true);
  const closeGameModal = () => setGameModalIsOpen(false);

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
        form.elements.schedulingAlgo.value === deck.scheduling_algorithm &&
        form.elements.shuffleUnseenCards.checked === deck.shuffle_unseen_cards &&
        parseInt(form.elements.dailyNewCardLimit.value) === deck.daily_new_card_limit &&
        parseInt(form.elements.dailySeenCardLimit.value) === deck.daily_seen_card_limit &&
        parseInt(form.reviewAheadMinutes.value) === deck.review_ahead_minutes &&
        form.elements.deckDifficulty.value === deck.difficulty
    ) {
      return;
    }

    // Tell the API to update the deck/CSSM
    if (deck.serializer_name === 'deck') {
      apiDeckEdit(
        deck.id,
        form.elements.title.value,
        form.elements.schedulingAlgo.value,
        form.elements.shuffleUnseenCards.checked,
        parseInt(form.elements.dailyNewCardLimit.value),
        parseInt(form.elements.dailySeenCardLimit.value),
        parseInt(form.elements.reviewAheadMinutes.value),
        form.elements.deckDifficulty.value,
        (response, status) => {
          if (status === 200) {
            window.location.reload();
          } else {
            // Error updating deck
            errorHandler(response, status, 1000);
          }
      });
    } else if (deck.serializer_name === 'cssm') {
      apiSSMEdit(
        deck.id,
        form.elements.title.value,
        form.elements.schedulingAlgo.value,
        form.elements.shuffleUnseenCards.checked,
        parseInt(form.dailyNewCardLimit.value),
        parseInt(form.dailySeenCardLimit.value),
        parseInt(form.reviewAheadMinutes.value),
        deck.deck_ids, // editing `deckIds` is currently disabled, but will be re-added in the future
        form.elements.tags.value,
        form.elements.contains.value,
        form.elements.isLeech.value !== 'ANY' ? form.elements.isLeech.value === 'LEECH' : null,
        form.elements.learningStatus.value !== 'ANY' ? form.elements.learningStatus.value : null,
        parseInt(form.elements.minEase.value),
        parseInt(form.elements.maxEase.value),
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
      <DropdownButton className='other-btn mr-1' as={ButtonGroup} title='Other' id='bg-nested-dropdown' variant='secondary'>
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
        <Dropdown.Item
          href={`/decks/${deck.id}/stats/`}
          className='stats-btn w-100'
        >
          Statistics
        </Dropdown.Item>
        <GameModal
          deck={deck}
          modalIsOpen={gameModalIsOpen}
          closeModal={closeGameModal}
          submitHandler={gameSubmitHandler}
        />
      </DropdownButton>
    </ButtonGroup>
  );
}

// Modal pop-up for when the 'Edit' button is pressed
export function DeckEditCreateModal(props) {
  const {modalIsOpen, closeModal, submitHandler, deleteHandler} = props;
  // eslint-disable-next-line
  const deck = props.deck ?? {};
  const mode = props.mode ? props.mode.toLowerCase() : 'edit';
  
  const [showSearchSettings, setShowSearchSettings] = useState(false);
  const [decks] = useApiObjectHook<Deck[] | undefined>(
    apiDeckPrivateList,
    200,
    1026,
    [], null, null,
    !(Object.entries(deck).length === 0 || deck.serializer_name === 'deck') && showSearchSettings,
  );

  if (!deck) return null;
  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>
          {mode === 'edit' ?
            <>Edit "{deck.title}"</>
            :
            <>Creating deck</>
            }
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={submitHandler}>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor='title'>Title</Form.Label>
            <Form.Control
              type='text'
              placeholder='My deck'
              name='title'
              defaultValue={deck.title}
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='deckDifficulty'>Deck Difficulty</Form.Label>
            <Form.Control
              as='select'
              name='deckDifficulty'
              defaultValue={deck.difficulty}
              custom
            >
              <option value='HARD'>Memorize Everything (Recommended)</option>
              <option value='NORM'>Memorize Most Things</option>
              <option value='EASY'>Get the Overview</option>
            </Form.Control>
          </Form.Group>
          {Object.entries(deck).length === 0 || deck.serializer_name === 'deck' ? /* This is unavailable for CSSMs */ <>
            {mode === 'edit' && <ButtonGroup className='w-100 mb-2'>
              <Button href={`/decks/${deck.id}/get-updates/`} className='float-right update-btn'>
                Check for Updates
              </Button>
              <span className='mx-1' />
              <Button href={`/decks/${deck.id}/share/`} className='float-left make-public-btn'>
                Make Deck Public
              </Button>
            </ButtonGroup>}
            <div className='text-center d-flex'>
              <hr className='flex-grow-1' />
              <span className='px-2 align-self-center'>
                Advanced Options
              </span>
              <hr className='flex-grow-1' />
            </div>
          </> : <>
            <Button onClick={() => setShowSearchSettings(!showSearchSettings)} className='mb-3'>
              {`${showSearchSettings ? 'Hide' : 'Show'} Search Settings`}
            </Button>
            {showSearchSettings && decks && <SearchForm
              decks={decks}
              defaultContains={deck.contains}
              defaultTags={deck.tags}
              defaultLeech={deck.leech ? 'LEECH' : (deck.leech === false ? 'NOTLEECH' : undefined)}
              defaultLearningStatus={deck.learning_status}
              defaultMinEase={deck.min_ease}
              defaultMaxEase={deck.max_ease}
              hideSuspend={true}
              defaultSelectedDecks={deck.deck_ids.split(',')}
            />}
          </>}
          <Form.Group>
            <FormCheckbox name='shuffleUnseenCards' defaultChecked={deck.shuffle_unseen_cards}>
              Shuffle Unseen Cards
            </FormCheckbox>
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='dailyNewCardLimit'>
              Daily new card limit
            </Form.Label>
            <Form.Control
              type='number'
              name='dailyNewCardLimit'
              defaultValue={deck.daily_new_card_limit ? deck.daily_new_card_limit : 20}
              min='0'
              max='9999'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='dailySeenCardLimit'>
              Daily seen card limit
            </Form.Label>
            <Form.Control
              type='number'
              name='dailySeenCardLimit'
              defaultValue={deck.daily_seen_card_limit ? deck.daily_seen_card_limit : 1000}
              min='0'
              max='9999'
              required
            />
          </Form.Group>
          {Object.entries(deck).length > 0 &&
            <Form.Group>
              <Form.Label htmlFor='reviewAheadMinutes'>Review Ahead Minutes</Form.Label>
              <Form.Control
                type='number'
                name='reviewAheadMinutes'
                defaultValue={deck.review_ahead_minutes ? deck.review_ahead_minutes : 120}
                min='0'
                max='5000000'
                required
              />
            </Form.Group>
          }
          <Form.Group>
            <Form.Label htmlFor='schedulingAlgo'>Scheduling Algorithm</Form.Label>
            <Form.Control
              as='select'
              name='schedulingAlgo'
              defaultValue={deck.scheduling_algorithm}
              custom
            >
              <option value='ANKING'>Optimized Anki Settings</option>
              <option value='ANKI'>Default Anki Settings</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {mode === 'edit' &&
            <Button onClick={deleteHandler} variant='danger' className='text-left mr-auto'>
              Delete {deck.serializer_name === 'deck' ? 'Deck' : 'Custom Study'}
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
    </Modal>
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
                <Form.Control type='text' defaultValue={deck.title} name='destinationTitle' required />
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

// Modal for selecting a game to play
export function GameModal({ modalIsOpen, closeModal, submitHandler, deck }) {
  const [gameType, setGameType] = useState('MATCHING');
  const [flashcardType, setFlashcardType] = useState('SEEN');
  
  return (<>
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
  </>);
}

export function SelectFlashcardsButtonGroup(props) {
  const {selectionMode, setSelectionMode, selectedFlashcards, setSelectedFlashcards, tagEditorModalIsOpen, setTagEditorModalIsOpen} = props;
  const [tagEditAction, setTagEditAction] = useState('ADD');
  const [updatingTags, setUpdatingTags] = useState(false);

  const editTags = event => {
    event.preventDefault();
    const form = event.target;
    if (!updatingTags) {
      setUpdatingTags(true);
      console.log(
        selectedFlashcards,
        tagEditAction,
        form.elements.tagValue.value,
      )
      apiFlashcardEditTags(selectedFlashcards, tagEditAction, form.elements.tagValue.value, (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error updating flashcard tags in bulk
          errorHandler(response, status, 2006);
        }
        setUpdatingTags(false);
      })
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
                  onChange={event => setTagEditAction(event.target.value)}
                  custom
                >
                  <option value='ADD'>Add Tag to All Selected</option>
                  <option value='REMOVE'>Remove Tag from all Selected</option>
                  {/* <option value='RENAME'>Rename Tag in all Selected</option> */}
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Tag to {tagEditAction === 'ADD' ? 'Add' : 'Remove'}</Form.Label>
                <Form.Control type='text' name='tagValue' required />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => setTagEditorModalIsOpen(false)}>
                Cancel
              </Button>
              <Button type='submit'>{updatingTags ? 'Updating...' : 'Update Tags'}</Button>
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
