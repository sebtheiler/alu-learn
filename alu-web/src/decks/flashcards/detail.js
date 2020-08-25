import React from 'react';
import {Button, OverlayTrigger} from 'react-bootstrap';
import {generateTooltip} from '../../utils';
import './detail.css';
import ReactMarkdown from 'react-markdown';
import RemarkMathPlugin from 'remark-math';
import {BlockMath, InlineMath} from 'react-katex';
import 'katex/dist/katex.min.css';


// Display an individual flashcard
export function FlashCard(props) {
  // `flashcard` is a JSON object
  // `handleSuspend` and `handleDelete` are callback functions
  const {flashcard, number, handleSuspend, handleDelete, foreignUser} = props;
  let date = new Date(flashcard.next_review)

  if (!flashcard) {
    return null;
  };
  
  return (
    <div className={'container-fluid border my-3' + (foreignUser ? '' : (flashcard.is_suspended ? ' suspended' : '') + (flashcard.is_leech ? ' leech' : ''))}>
      <div className='row mt-3 text-center'>
        <div className='col-md-12'>
          <p className='mb-0'>
            <strong>Flashcard - #{number + 1}</strong>
            {flashcard.learning_status !== 'UNSEEN' ? <>| Due {date.toString().substring(0, 10)}</> : null}
          </p>
          <p className={foreignUser ? 'd-none' : ''}>
            <OverlayTrigger
              overlay={generateTooltip(
                `A leech is a card that you've repeatedly struggled to learn.
                You should give this card special attention, such as rewording the question, or reviewing the material.
                You can learn more here TODO`
              )}
              placement='right'
              delay={{ show: 20, hide: 800 }}
            >
              <em>{flashcard.is_leech ? '⚠️ This flashcard is a leech ⚠️ ' : ''}</em>
            </OverlayTrigger>
            <OverlayTrigger
              overlay={generateTooltip(
                `A suspended card will not be shown to you when you study this deck. Learn more here TODO.`
              )}
              placement='right'
              delay={{ show: 20, hide: 800 }}
            >
              <em>{flashcard.is_suspended ? ' ⚠️ This flashcard is suspended ⚠️' : ''}</em>
            </OverlayTrigger>
          </p>
        </div>
      </div>
      <div className='row'>
        <div className='col-md-6 text-center'>
          <ReactMarkdown
            source={flashcard.front_text}
            plugins={[RemarkMathPlugin]}
            renderers={{
              math: ({ value }) => <BlockMath>{value}</BlockMath>,
              inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
            }}
          />
        </div>
        <div className='col-md-6 text-center'>
          <ReactMarkdown
            source={flashcard.back_text}
            plugins={[RemarkMathPlugin]}
            renderers={{
              math: ({ value }) => <BlockMath>{value}</BlockMath>,
              inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
            }}
          />
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
            <Button href={`${flashcard.id}/edit/`} variant='primary'>Edit</Button>
            <Button onClick={handleSuspend} variant='primary' className='ml-1'>{flashcard.is_suspended ? 'Unsuspend' : 'Suspend'}</Button>
            <Button onClick={handleDelete} variant='danger' className='ml-1'>Delete</Button>
          </div>
        </div>
      }
    </div>
  );
};