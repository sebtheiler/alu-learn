import React, {useState} from 'react';
import {apiFlashCardCreate, apiFlashCardEdit, apiFlashCardDetail} from '../../lookup';
import {Button, Form, OverlayTrigger} from 'react-bootstrap';
import {generateTooltip, errorHandler, QuestionBubble} from '../../utils';


function FreezeOverlay(props) {
  return (
    <OverlayTrigger
      overlay={generateTooltip(
        `You can freeze a field to keep its value the same after creating your flashcard.
        Useful for creating multiple similar flashcards.`
        )}
        placement='right'
        delay={{ hide: 100 }}
        >
      {props.children}
    </OverlayTrigger>
  );
};

// Function for card create form
export function FlashCardCreate(props) {
  const frontTextRef = React.createRef();
  const backTextRef = React.createRef();
  const tagsRef = React.createRef();
  // const markdownRef = React.createRef();
  // const latexRef = React.createRef();
  // `deckId`: ID of the deck in which to create flashcard
  // `returnToPreviousPage`: If true, redirect the user to the previous page (used for editing)
  // `flashcardId`: If not null/undefined, the ID of the flashcard to EDIT
  const {deckId, returnToPreviousPage, flashcardId} = props;
  let btn_label = 'Create';

  const [freezeFront, setFreezeFront] = useState(false);
  const [freezeBack, setFreezeBack] = useState(false);
  const [freezeTags, setFreezeTags] = useState(false);

  // Warn user before leaving page (adapted from https://stackoverflow.com/a/7317311)
  window.addEventListener("beforeunload", () => {});

  // If we are editing a card, get its current values
  if (isNaN(flashcardId) === false) {
    btn_label = 'Save';
    apiFlashCardDetail(deckId, flashcardId, (response, status) => {
      if (status === 200) {
        frontTextRef.current.value = response.front_text;
        backTextRef.current.value = response.back_text;
        tagsRef.current.value = response.tags;
      } else {
        // Error getting flashcard detail
        errorHandler(response, status, 2000);
      };
    });
  };

  // Called after the request is sent to the backend to create a flashcard
  const handleBackendUpdate = (response, status) => {
    if (status === 201 || status === 200) {
      // If the user should be redirected, redirect them
      if (returnToPreviousPage) {
        window.history.back();
      };

      // Make the textareas empty
      frontTextRef.current.focus();
      if (freezeFront === false) {
        frontTextRef.current.value = '';
      };
      if (freezeBack === false) {
        backTextRef.current.value = '';
      };
      if (freezeTags === false) {
        tagsRef.current.value = '';
      };
    } else {
      // Error creating/editing flashcard
      errorHandler(response, status, 2001);
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
        tagsRef.current.value,
        handleBackendUpdate,
      );
    } else {
      // This implies we are creating a card
      apiFlashCardCreate(
        deckId,
        frontTextRef.current.value,
        backTextRef.current.value,
        tagsRef.current.value,
        handleBackendUpdate,
      );
    };
  };

  return (
    <div className={props.className}>
      <Form onSubmit={handleSubmit}>
        <Form.Group className='blue-border-focus'>
          <Form.Label htmlFor='frontText' className='mb-0 mt-3 w-100'>
            <p className='mb-1'>
            {returnToPreviousPage ? null : <FreezeOverlay><i
                className='far fa-snowflake mb-1 mr-1 fa-lg'
                onClick={event => {event.preventDefault(); setFreezeFront(!freezeFront)}}
                style={{cursor: 'pointer', color: freezeFront ? '#89ACFF' : '#6C757D'}}
              /></FreezeOverlay>}
              Front
            </p>
          </Form.Label>
          <Form.Control
            as='textarea'
            rows='8'
            name='frontText'
            placeholder='Front Text'
            ref={frontTextRef}
            autoFocus
            required
          />
          <Form.Label htmlFor='backText' className='mb-0 mt-3 w-100'>
            <p className='mb-0'>
              {returnToPreviousPage ? null : <FreezeOverlay><i
                className='far fa-snowflake mb-1 mr-1 fa-lg'
                onClick={event => {event.preventDefault(); setFreezeBack(!freezeBack)}}
                style={{cursor: 'pointer', color: freezeBack ? '#89ACFF' : '#6C757D'}}
              /></FreezeOverlay>}
              Back
            </p>
          </Form.Label>
          <Form.Control
            as='textarea'
            rows='8'
            name='backText'
            placeholder='Back Text'
            ref={backTextRef}
            required
          />
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor='tags' className='mb-0 w-100'>
            <p className='mb-0'>
              {returnToPreviousPage ? null : <FreezeOverlay><i
                className='far fa-snowflake mb-1 mr-1 fa-lg'
                onClick={event => {event.preventDefault(); setFreezeTags(!freezeTags)}}
                style={{cursor: 'pointer', color: freezeTags ? '#89ACFF' : '#6C757D'}}
              /></FreezeOverlay>}
              Tags (separate with commas){' '}
              <QuestionBubble>
                You can give your flashcards tags to group them together.
                Learn more here TODO
              </QuestionBubble>
            </p>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder='Calculus, Integrals, Exponentials, ...'
            ref={tagsRef}
            name='tags'
            maxLength='1024'
          />
        </Form.Group>
        <Form.Group className='text-center mt-1'>
          <Button type='submit' variant='primary' block>{btn_label}</Button>
        </Form.Group>
      </Form>
    </div>
  );
};