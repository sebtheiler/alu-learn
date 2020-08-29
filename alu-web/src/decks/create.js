import React from 'react';
import {apiDeckCreate} from '../lookup';
import { errorHandler } from '../utils';


// Component for the deck create form displayed at
// the top of the home page
export function DeckCreate(props) {
  const inputTextRef = React.createRef();
  // `didCreateDeck` is a callback function that is passed
  // the API's response to creating a new deck
  const {didCreateDeck} = props;

  // Called when the user presses the 'Create' button
  // Sends a request to the backend to create a deck
  // with the title of the text in the text ref
  const handleSubmit = (event) => {
    event.preventDefault();
    const textVal = inputTextRef.current.value;
    apiDeckCreate(textVal, (response, status) => {
      if (status === 201) {
        didCreateDeck(response);
      } else {
        // Error creating deck
        errorHandler(response, status, 1004);
      };
    });
    inputTextRef.current.value = '';
  };

  // In the future, this may be a modal
  // Furthermore, it may also have more options such as sharing
  // setting, and so forth TODO:
  return (<div className={props.className}>
            <form onSubmit={handleSubmit}>
              <input type='text' required='required' className='form-control text-center' name='title' placeholder='My deck' ref={inputTextRef} />
              <div className='text-center mt-1'>
                <button type='submit' className='btn btn-primary my-3'>Create</button>
              </div>
            </form>
          </div>);
};