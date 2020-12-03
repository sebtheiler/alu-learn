import React, {useState} from 'react';
import {apiDeckCreate} from '../lookup';
import { errorHandler } from '../utils';
import { Button } from 'react-bootstrap';
import {DeckEditCreateModal} from './buttons';


// Button for opening modal to create deck
export function DeckCreate(props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  // Called when the user presses the 'Create' button
  // Sends a request to the backend to create a deck
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    apiDeckCreate(
      form.elements.title.value,
      form.elements.shuffleUnseenCards.checked,
      parseInt(form.elements.dailyNewCardLimit.value),
      form.elements.schedulingAlgo.value,
      form.elements.deckDifficulty.value,
      (response, status) => {
        if (status === 201) {
          window.location.reload();
        } else {
          // Error creating deck
          errorHandler(response, status, 1004);
        };
      },
    );
  };

  return (
    <>
      <Button
        onClick={openModal}
        variant='primary'
        className={props.className}
      >
        Create new Deck
      </Button>
      <DeckEditCreateModal
        mode='create'
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        submitHandler={handleSubmit}
      />
    </>
  );
};