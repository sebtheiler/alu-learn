import React from 'react';


// Display an individual flashcard
export function FlashCard(props) {
  const {flashcard, number} = props; // JSON object

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
            <div className='col-md-12 mb-3 text-right'>
              <div className="btn-group">
                <button className='btn btn-primary'>Edit</button>
                <button className='btn btn-danger mx-1'>Delete</button>
                {/* <button className='btn btn-outline-primary mx-1'>Text</button>
                <button className='btn btn-outline-primary mx-1'>Text</button> */}
              </div>
            </div>
          </div>)
};