import React from 'react';
import {apiFlashCardCreate, apiFlashCardEdit, apiFlashCardDetail} from '../lookup';


// Function for card create form
export function FlashCardCreate(props) {
  const frontTextRef = React.createRef();
  const backTextRef = React.createRef();
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
      frontTextRef.current.value = '';
      backTextRef.current.value = '';
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
        handleBackendUpdate,
      );
    } else {
      // This implies we are creating a card
      // TODO: set focus back to top input area
      apiFlashCardCreate(
        deckId,
        frontTextRef.current.value,
        backTextRef.current.value,
        handleBackendUpdate,
      );
    };
  };

  return (<div className={props.className}>
            <form onSubmit={handleSubmit}>
              <div className='form-group blue-border-focus'>
                <textarea required='required' className='form-control mt-3' name='frontText' placeholder='Front Text' ref={frontTextRef} rows='10' />
                <textarea required='required' className='form-control mt-3 ' name='backText' placeholder='Back Text' ref={backTextRef} rows='10' />
              </div>
              <div className='text-center mt-1'>
                <button type='submit' className='btn btn-primary btn-block'>{btn_label}</button>
              </div>
            </form>
          </div>);
};