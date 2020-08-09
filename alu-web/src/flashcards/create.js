import React from 'react';
import {apiFlashCardCreate} from '../lookup';


// Function for card create form
export function FlashCardCreate(props) {
  const frontTextRef = React.createRef();
  const backTextRef = React.createRef();
  const {deckId} = props;

  // Called after the request is sent to the backend to create a flashcard
  const handleBackendUpdate = (response, status) => {
    if (status === 201) {
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
    apiFlashCardCreate(
      deckId,
      frontTextRef.current.value,
      backTextRef.current.value,
      handleBackendUpdate,
    );
  };

  return (<div className={props.className}>
            <form onSubmit={handleSubmit}>
              <div className='form-group blue-border-focus'>
                <textarea required='required' className='form-control mt-3' name='frontText' placeholder='Front Text' ref={frontTextRef} rows='10' />
                <textarea required='required' className='form-control mt-3 ' name='backText' placeholder='Back Text' ref={backTextRef} rows='10' />
              </div>
              <div className='text-center mt-1'>
                <button type='submit' className='btn btn-primary btn-block'>Create</button>
              </div>
            </form>
          </div>);
};