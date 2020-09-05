import React, {useState} from 'react';
import {apiDeckDelete, apiDeckEdit, apiDeckCopy} from '../lookup';
import {errorHandler, FormCheckbox} from '../utils';
import {Modal, Button, Form, ButtonGroup} from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";


// Buttons for when an owner views their deck
export function DeckDefaultButtonGroup(props) {
  const {deck, vertical, hideBrowse} = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const saveHandler = (event) => {
    event.preventDefault();
    const form = event.target;

    // If nothing has changed, prevent the user from saving
    if (
        form.elements.title.value === deck.title &&
        form.elements.description.value === deck.description &&
        form.elements.sharingSetting.value === deck.sharing_setting &&
        form.elements.schedulingAlgo.value === deck.scheduling_algorithm &&
        form.elements.shuffleUnseenCards.checked === deck.shuffle_unseen_cards &&
        parseInt(form.elements.dailyNewCardLimit.value) === deck.daily_new_card_limit
    ) {
      return;
    };

    // Tell the API to update the deck
    apiDeckEdit(
      deck.id,
      form.elements.title.value,
      form.elements.description.value,
      form.elements.sharingSetting.value,
      form.elements.schedulingAlgo.value,
      form.elements.shuffleUnseenCards.checked,
      parseInt(form.elements.dailyNewCardLimit.value),
      (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else {
          // Error updating deck
          errorHandler(response, status, 1000);
        };
    });
  };

  const deleteHandler = () => {
    apiDeckDelete(deck.id, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        // Error deleting deck
        errorHandler(response, status, 1001);
      };
    });
  };

  return (
    <ButtonGroup vertical={vertical} style={vertical ? {display: 'block', margin: '0 auto', 'text-align': 'center', width: '50%'} : {}}>
      {/* Edit Button and Modal */}
      <Button
        onClick={openModal}
        variant='primary'
        className='mr-1'
      >
        Edit
      </Button>
      <DeckEditCreateModal
        deck={deck}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        submitHandler={saveHandler}
        deleteHandler={deleteHandler}
      />

      {/* Other buttons */}
      <Button href={`/decks/${deck.id}/flashcards/create/`} className='mr-1'>
        Add Cards
      </Button>
      {hideBrowse ? null :
        <Button href={`/decks/${deck.id}/flashcards/`} className='mr-1'>
          Browse
        </Button>
      }
      <Button href={`/decks/${deck.id}/study/`} className='mr-1'>
        Study
      </Button>
    </ButtonGroup>
  );
};

// Modal pop-up for when the 'Edit' button is pressed
export function DeckEditCreateModal(props) {
  const {modalIsOpen, closeModal, submitHandler, deleteHandler} = props;
  const deck = props.deck ? props.deck : {};
  const mode = props.mode ? props.mode.toLowerCase() : 'edit';

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
            <Form.Label htmlFor='description'>Description</Form.Label>
            <Form.Control
              as='textarea'
              rows='3'
              placeholder="My deck's description"
              name='description'
              defaultValue={deck.description}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='sharingSetting'>Sharing Setting</Form.Label>
            <Form.Control
              as='select'
              name='sharingSetting'
              defaultValue={deck.sharing_setting}
              custom
            >
              <option value='PRIVATE'>Private</option>
              <option value='FRIENDS'>Friends only</option>
              <option value='PUBLIC'>Public</option>
            </Form.Control>
          </Form.Group>
          <div className='text-center d-flex'>
            <hr className='flex-grow-1' />
            <span className='px-2 align-self-center'>
              Advanced Options
            </span>
            <hr className='flex-grow-1' />
          </div>
          <Form.Group>
            <FormCheckbox name='shuffleUnseenCards' defaultChecked={deck.shuffle_unseen_cards}>
              Shuffle Unseen Cards
            </FormCheckbox>
            {/* <Form.Check
              type='checkbox'
              label='Shuffle Unseen Cards'
              name='shuffleUnseenCards'
              defaultChecked={deck.shuffle_unseen_cards}
            /> */}
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='dailyNewCardLimit'>Daily new card limit</Form.Label>
            <Form.Control
              type='number'
              name='dailyNewCardLimit'
              defaultValue={deck.daily_new_card_limit ? deck.daily_new_card_limit : 20}
              min='1'
              max='9999'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='schedulingAlgo'>Scheduling Algorithm</Form.Label>
            <Form.Control
              as='select'
              name='schedulingAlgo'
              defaultValue={deck.scheduling_algorithm}
              custom
            >
              <option value='ANKI'>Default Anki Settings</option>
              <option value='ANKING'>Optimized Anki Settings by "Anking"</option>schedulingAlgo
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          {mode === 'edit' ?
            <Button onClick={deleteHandler} variant='danger' className='text-left mr-auto'>Delete Deck</Button>
          : null}
          <Button onClick={closeModal} variant='secondary'>Cancel</Button>
          <Button type='submit' variant='primary'>
            {mode === 'edit' ? 'Save' : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Buttons displayed when a user that does not own the deck views a deck
export function DeckForeignUserButtonGroup(props) {
  const {deck, handleThankDeck, thankBtnLabel} = props;
  const [copyState, setCopyState] = useState('Copy deck');

  const handleCopyDeck = (event) => {
    event.preventDefault();
    setCopyState('Loading...');
    apiDeckCopy(deck.id, (response, status) => {
      if (status === 200) {
        setCopyState('Copied');
      } else {
        // Error copying deck
        setCopyState('Copy');
        errorHandler(response, status, 1002)
      };
    });
  };

  return (
    <div className='text-center'>
      <ButtonGroup>
        <Button onClick={handleCopyDeck}>
          {copyState}
        </Button>
        <Button onClick={handleThankDeck} className='ml-1'>
          {thankBtnLabel}
        </Button>
      </ButtonGroup>
    </div>
  );
};