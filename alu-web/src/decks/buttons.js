import React, {useState} from 'react';
import {apiDeckDelete, apiDeckEdit, apiDeckCopy} from '../lookup';
import {Modal, Button, Form, ButtonGroup} from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";


// Buttons for when an owner views their deck
export function DeckDefaultButtonGroup(props) {
  const {deck, vertical} = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const saveHandler = (event) => {
    event.preventDefault();
    let form = event.target;

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
          console.log(response, status);
          alert('Error saving your deck');
        };
    });
  };

  const deleteHandler = () => {
    apiDeckDelete(deck.id, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else if (status === 403) {
        alert('You must log in!');
      } else {
        console.log(response, status);
        alert('Error deleting your deck!');
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
      <DeckEditModal
        deck={deck}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        saveHandler={saveHandler}
        deleteHandler={deleteHandler}
      />

      {/* Other buttons */}
      <Button href={`/decks/${deck.id}/flashcards/create/`} className='mr-1'>
        Add Cards
      </Button>
      <Button href={`/decks/${deck.id}/flashcards/`} className='mr-1'>
        Browse
      </Button>
      <Button href={`/decks/${deck.id}/study/`} className='mr-1'>
        Study
      </Button>
    </ButtonGroup>
  );
};

// Modal pop-up for when the 'Edit' button is pressed
export function DeckEditModal(props) {
  const {deck, modalIsOpen, closeModal, saveHandler, deleteHandler} = props;

  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>
          Edit "{deck.title}"
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={saveHandler}>
        <Modal.Body>
          <Form.Group>
            <Form.Label htmlFor='title'>Title</Form.Label>
            <Form.Control type='text' placeholder='My deck' name='title' defaultValue={deck.title} />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='description'>Description</Form.Label>
            <Form.Control as='textarea' rows='3' placeholder="My deck's description" name='description' defaultValue={deck.description} />
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
          <Form.Group>
            <Form.Check
              type='checkbox'
              label='Shuffle Unseen Cards'
              name='shuffleUnseenCards'
              defaultChecked={deck.shuffle_unseen_cards}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='dailyNewCardLimit'>Daily new card limit</Form.Label>
            <Form.Control
              type='number'
              name='dailyNewCardLimit'
              defaultValue={deck.daily_new_card_limit}
              min='1'
              required
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='schedulingAlgo'>Scheduling Algorithm (Advanced)</Form.Label>
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
          <Button onClick={deleteHandler} variant='danger' className='text-left mr-auto'>Delete Deck</Button>
          <Button onClick={closeModal} variant='secondary'>Cancel</Button>
          <Button type='submit' variant='primary'>Save</Button>
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
        setCopyState('Copy');
        console.log(response, status);
        alert('Error copying deck!');
      }
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