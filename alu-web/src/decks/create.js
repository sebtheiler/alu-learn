import React from 'react';
import {apiDeckCreate} from '../lookup';

export function DeckCreate(props) {
  const inputTextRef = React.createRef();
  const {didCreateDeck} = props

  const handleBackendUpdate = (response, status) => {
    if (status === 201) {
      didCreateDeck(response);
    } else {
      console.log(response);
      alert('A server error occured');
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const textVal = inputTextRef.current.value;
    apiDeckCreate(textVal, handleBackendUpdate);
    inputTextRef.current.value = '';
  };
  
  return (<div className={props.className}>
            <form onSubmit={handleSubmit}>
              <input type='text' required='required' className='form-control text-center' name='title' placeholder='My deck' ref={inputTextRef} />
              <div className='text-center mt-1'><button type='submit' className='btn btn-primary my-3'>Create</button></div>
            </form>
          </div>);
};