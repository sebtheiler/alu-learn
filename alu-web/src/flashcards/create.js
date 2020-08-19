import React from 'react';
import {apiFlashCardCreate, apiFlashCardEdit, apiFlashCardDetail} from '../lookup';
import {Button, Form, OverlayTrigger} from 'react-bootstrap';
import {generateTooltip} from './utils';


// Function for card create form
export function FlashCardCreate(props) {
  const frontTextRef = React.createRef();
  const backTextRef = React.createRef();
  const tagRef = React.createRef();
  // `deckId`: ID of the deck in which to create flashcard
  // `redirectUrl`: If not null/undefined, where to redirect the user upon completion
  // `flashcardId`: If not null/undefined, the ID of the flashcard to EDIT
  const {deckId, redirectUrl, flashcardId} = props;
  let btn_label = 'Create';

  // If we are editing a card, get its current values
  if (isNaN(flashcardId) === false) {
    btn_label = 'Save';
    apiFlashCardDetail(deckId, flashcardId, (response, status) => {
      if (status === 200) {
        frontTextRef.current.value = response.front_text;
        backTextRef.current.value = response.back_text;
        tagRef.current.value = response.tags;
      } else {
        console.log(response, status);
        alert('Something went wrong editing your flashcard');
      };
    });
  };

  // Called after the request is sent to the backend to create a flashcard
  const handleBackendUpdate = (response, status) => {
    if (status === 201 || status === 200) {
      // If the user should be redirected, redirect them
      if (redirectUrl) {
        window.location.href = redirectUrl;
      };
      // Make the textareas empty
      frontTextRef.current.focus();
      frontTextRef.current.value = '';
      backTextRef.current.value = '';
      tagRef.current.value = '';
    } else if (status === 403) {
      alert('You must log in before you create a flashcard')
    } else {
      console.log(response, status);
      alert('An error occured creating the flashcard');
    };
  };

  // Called when the form is submitted
  // Sends a request to the backend to create a flashcard
  const handleSubmit = (event) => {
    event.preventDefault();
    if (isNaN(flashcardId) === false) {
      // This implies we are editing a card
      apiFlashCardEdit(
        deckId,
        flashcardId,
        frontTextRef.current.value,
        backTextRef.current.value,
        tagRef.current.value,
        handleBackendUpdate,
      );
    } else {
      // This implies we are creating a card
      // TODO: set focus back to top input area
      apiFlashCardCreate(
        deckId,
        frontTextRef.current.value,
        backTextRef.current.value,
        tagRef.current.value,
        handleBackendUpdate,
      );
    };
  };

  return (
    <div className={props.className}>
      <Form onSubmit={handleSubmit}>
        <Form.Group className='blue-border-focus'>
          <Form.Label className='mb-0 mt-3'>
            <small className='text-secondary'>Front</small>
          </Form.Label>
          <Form.Control
            as='textarea'
            rows='10'
            name='frontText'
            placeholder='Front Text'
            ref={frontTextRef}
            autoFocus
          />
          <Form.Label className='mb-0 mt-3'>
            <small className='text-secondary'>Back</small>
          </Form.Label>
          <Form.Control
            as='textarea'
            rows='10'
            name='backText'
            placeholder='Back Text'
            ref={backTextRef}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label className='mb-0'>
            <OverlayTrigger
              overlay={generateTooltip(
                `You can give your flashcards tags to group them together.
                Learn more here TODO`
              )}
              placement='right'
              delay={{ show: 20, hide: 800 }}
            >
              <small className='text-secondary'>Tags (separate with commas)</small>
            </OverlayTrigger>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder='Calculus, Integrals, Exponentials, ...'
            ref={tagRef}
          />
        </Form.Group>
        <Form.Group className='text-center mt-1'>
          <Button type='submit' variant='primary' block>{btn_label}</Button>
        </Form.Group>
      </Form>
    </div>
  );
};