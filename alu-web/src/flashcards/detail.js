import React from 'react';
import {Button, Tooltip, OverlayTrigger} from 'react-bootstrap';
import './detail.css';


// Display an individual flashcard
export function FlashCard(props) {
  // `flashcard` is a JSON object
  // `handleSuspend` and `handleDelete` are callback functions
  const {flashcard, number, handleSuspend, handleDelete} = props;
  let date = new Date(flashcard.next_review)

  const generateTooltip = (text) => {
    return (props) => (
      <Tooltip className='button-tooltip' {...props}>
        {text}
      </Tooltip>
    );
  };
  
  return (
    <div className={'container-fluid border my-3' + (flashcard.is_suspended ? ' suspended' : '') + (flashcard.is_leech ? ' leech' : '')}>
      <div className='row mt-3 text-center'>
        <div className='col-md-12'>
          <p className='mb-0'>
            <strong>Flashcard - #{number + 1}</strong> | Due {date.toString().substring(0, 10)}
          </p>
          <p>
            <OverlayTrigger
              overlay={generateTooltip(
                `A leech is a card that you've repeatedly struggled to learn.
                You should give this card special attention, such as rewording the question, or reviewing the material.
                You can learn more here TODO`
              )}
              placement='right'
              delay={{ show: 20, hide: 800 }}
            >
              <em>{flashcard.is_leech ? '⚠️ This flash card is a leech ⚠️ ' : ''}</em>
            </OverlayTrigger>
            <OverlayTrigger
              overlay={generateTooltip(
                `A suspended card will not be shown to you when you study this deck. Learn more here TODO.`
              )}
              placement='right'
              delay={{ show: 20, hide: 800 }}
            >
              <em>{flashcard.is_suspended ? ' ⚠️ This flash card is suspended ⚠️' : ''}</em>
            </OverlayTrigger>
          </p>
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
          <Button href={`${flashcard.id}/edit/`} variant='primary'>Edit</Button>
          <Button onClick={handleSuspend} variant='primary' className='ml-1'>{flashcard.is_suspended ? 'Unsuspend' : 'Suspend'}</Button>
          <Button onClick={handleDelete} variant='danger' className='ml-1'>Delete</Button>
        </div>
      </div>
    </div>
  );
};