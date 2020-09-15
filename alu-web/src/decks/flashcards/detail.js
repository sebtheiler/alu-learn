import React, {useState} from 'react';
import {Button} from 'react-bootstrap';
import {QuestionBubble, errorHandler, MarkdownRender} from '../../utils';
import {apiFlashCardSuspendLeech, apiFlashCardDelete} from '../../lookup';
import './detail.css';

// Display an individual flashcard
export function FlashCard(props) {
  const {flashcard, number, showParentDeckTitle, suspendCallback, deleteCallback, foreignUser} = props;
  let date = new Date(flashcard.next_review)

  const [deleteIsLoading, setDeleteIsLoading] = useState(false);
  const [suspendIsLoading, setSuspendIsLoading] = useState(false);

  const handleSuspend = (event) => {
    event.preventDefault();

    if (suspendIsLoading === false) {
      setSuspendIsLoading(true);
  
      const action = flashcard.is_suspended ? 'unsuspend' : 'suspend';
      apiFlashCardSuspendLeech(flashcard.parent_deck_id, flashcard.id, action, (response, status) => {
        if (status === 200) {
          flashcard.is_suspended = action === 'suspend';
          suspendCallback();
          setSuspendIsLoading(false);
        } else {
          // Error suspending/leeching flashcard
          errorHandler(response, status, 2003);
        };
      });
    };
  };

  const handleDelete = (event) => {
    event.preventDefault();

    if (deleteIsLoading === false) {
      setDeleteIsLoading(true);

      apiFlashCardDelete(flashcard.parent_deck_id, flashcard.id, (response, status) => {
        if (status === 200) {
          deleteCallback();
          setDeleteIsLoading(false);
        } else {
          // Error deleting flashcard
          errorHandler(response, status, 2004);
        };
      });
    };
  };

  if (!flashcard) {
    return null;
  };

  return (
    <div className={'container-fluid border my-3' + (foreignUser ? '' : (flashcard.is_suspended ? ' suspended' : '') + (flashcard.is_leech ? ' leech' : ''))}>
      <div className='row mt-3 text-center'>
        <div className='col-md-12'>
          <p className='mb-0'>
            <strong>Flashcard - #{number + 1}</strong>
            {flashcard.learning_status !== 'UNSEEN' && !foreignUser ? <> | Due {date.toString().substring(0, 10)}</> : null}
          </p>
          {showParentDeckTitle ? 
            <small className='text-secondary'>
              From <a href={`/decks/${flashcard.parent_deck_id}/`}>"{flashcard.parent_deck_title}"</a>
            </small>
          : null}
          <p className={foreignUser ? 'd-none' : ''}>
            <em className={flashcard.is_leech ? '' : 'd-none'}>
              This flashcard is a leech{' '}
              <QuestionBubble>
                A leech is a card that you've repeatedly struggled to learn.
                You should give this card special attention, such as rewording the question, or reviewing the material.
                You can learn more [here](/help/leeches/).
              </QuestionBubble>
              <br />
            </em>
            <em className={flashcard.is_suspended ? '' : 'd-none'}>
              This flashcard is suspended{' '}
              <QuestionBubble>
                A suspended card will not be shown to you when you study this deck. Learn more [here](/help/suspended/).
              </QuestionBubble>
              <br />
            </em>
          </p>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-6 text-center'>
          <MarkdownRender source={flashcard.front_text} />
        </div>
        <div className='col-md-6 text-center'>
          <MarkdownRender source={flashcard.back_text} />
        </div>
      </div>
      <div className='text-center mx-auto w-50' style={{wordWrap: 'break-word'}}>
        {flashcard.tags ? 
          <>
            Tags: <br />
            {flashcard.tags}
          </>
        : null}
      </div>
      {foreignUser ? null : 
        <div className='col-md-12 mb-3 text-center'>
          <div className='btn-group'>
            <Button href={`/decks/${flashcard.parent_deck_id}/flashcards/${flashcard.id}/edit/`} variant='primary'>Edit</Button>
            <Button onClick={handleSuspend} variant='primary' className='ml-1'>
              {suspendIsLoading ? (flashcard.is_suspended ? 'Unsuspending...' : 'Suspending...') : (flashcard.is_suspended ? 'Unsuspend' : 'Suspend')}
            </Button>
            <Button onClick={handleDelete} variant='danger' className='ml-1'>
              {deleteIsLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      }
    </div>
  );
};