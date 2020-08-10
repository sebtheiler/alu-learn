import React from 'react';


// Display an individual flashcard
export function FlashCard(props) {
  // `flashcard` is a JSON object
  // `handleSuspend` and `handleDelete` are callback functions
  const {flashcard, number, handleSuspend, handleDelete} = props;

  return (<div className='container-fluid border my-3'>
            <div className='row mt-3 text-center'>
              <div className='col-md-12'>
                <p><strong>Flashcard - #{number + 1}</strong></p>
              </div>
            </div>
            <div className='row'>
              <div className='col-md-6'>
                <p className='text-center'>{flashcard.front_text}</p>
              </div>
              <div className='col-md-6'>
                <p className='text-center'>{flashcard.back_text}</p>
              </div>
            </div>
            <div className='col-md-12 mb-3 text-center'>
              <div className="btn-group">
                <a href={`${flashcard.id}/edit/`}><button className='btn btn-primary'>Edit</button></a>
                <button onClick={handleSuspend} className='btn btn-primary ml-1'>Suspend</button>
                <button onClick={handleDelete} className='btn btn-danger ml-1'>Delete</button>
              </div>
            </div>
          </div>)
};