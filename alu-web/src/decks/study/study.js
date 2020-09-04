import React, {useEffect, useState} from 'react';
import {getAnkiInterval} from './algorithm';
import {Button, Collapse} from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import RemarkMathPlugin from 'remark-math';
import {BlockMath, InlineMath} from 'react-katex';
import 'katex/dist/katex.min.css';

export function StudyElement(props) {
  const {currentCard, showAnswer, showAnswerHandler, backendGradeUpdate, handleKeyDown, getCanceledBtns, schedulingAlgorithm, deleteFlashCardHandler, leechsuspendFlashCardGenerator} = props;
  const [gotCanceledBtns, setGotCanceledBtns] = useState(false);
  const [optionButtonsExpanded, setOptionButtonsExpanded] = useState(false);

  
  // Used for handling keypresses
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAnswer, handleKeyDown]);
  
  // Allows the buttons to use the same function
  // as is used when handling keypressess for 1,2,3,4
  const buttonIntervalWrapper = (grade) => {
    return () => {
      backendGradeUpdate(grade);
    };
  };
  
  // TODO: optimize this
  const interval1 = getAnkiInterval(currentCard, 1, schedulingAlgorithm)
  const interval2 = getAnkiInterval(currentCard, 2, schedulingAlgorithm)
  const interval3 = getAnkiInterval(currentCard, 3, schedulingAlgorithm)
  const interval4 = getAnkiInterval(currentCard, 4, schedulingAlgorithm)

  // Get canceled buttons to handle keyboard presses correctly
  useEffect(() => {
    if (gotCanceledBtns === false && interval1.message !== 'NULL' && interval2.message !== 'NULL' && interval3.message !== 'NULL' && interval4.message !== 'NULL') {
      var canceledButtons = [];
      if (interval1.interval === -1) {
        canceledButtons.push('Again');
      };
      if (interval2.interval === -1) {
        canceledButtons.push('Hard');
      };
      if (interval3.interval === -1) {
        canceledButtons.push('Good');
      };
      if (interval4.interval === -1) {
        canceledButtons.push('Easy');
      };

      getCanceledBtns(canceledButtons);
      setGotCanceledBtns(true);
    };
  }, [gotCanceledBtns, getCanceledBtns, setGotCanceledBtns, interval1, interval2, interval3, interval4]);

  if (currentCard === null) {
    return null;
  };

  return (
    <>
      <div className='col-md-12 text-center' style={{minWidth: '200px'}}>
        <ReactMarkdown
          source={currentCard ? currentCard.front_text : null}
          plugins={[RemarkMathPlugin]}
          renderers={{
            math: ({ value }) => <BlockMath>{value}</BlockMath>,
            inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
          }}
        />
      </div>
      <hr />
      <div className='col-md-12 text-center' style={{minWidth: '200px'}}>
        <ReactMarkdown
          source={currentCard && showAnswer ? currentCard.back_text : ''}
          plugins={[RemarkMathPlugin]}
          renderers={{
            math: ({ value }) => <BlockMath>{value}</BlockMath>,
            inlineMath: ({ value }) => <InlineMath>{value}</InlineMath>
          }}
        />
      </div>
      <footer className='fixed-bottom mb-5'>
        <div className='mb-5'>
          <div className={'col-md-12 text-center btn-group mb-5' + (showAnswer || currentCard === null ? ' d-none' : '')}>
              <Button onClick={showAnswerHandler} id='showanswer'>Show Answer</Button>
          </div>
          <div className={'col-md-12 text-center btn-group mb-5' + (!showAnswer ? ' d-none' : '')}>
            <Button
              onClick={buttonIntervalWrapper(1)}
              className={'mx-1' + (interval1.interval === -1 ? ' d-none' : '')}
              variant='danger'
            >
              Again {interval1.interval.toString() + (interval1.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(2)}
              className={'mx-1' + (interval2.interval === -1 ? ' d-none' : '')}
              variant='warning'
            >
              Hard {interval2.interval.toString() + (interval2.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(3)}
              className={'mx-1' + (interval3.interval === -1 ? ' d-none' : '')}
              variant='success'
            >
              Good {interval3.interval.toString() + (interval3.isMinute ? 'm' : 'd')}
            </Button>
            <Button
              onClick={buttonIntervalWrapper(4)}
              className={'mx-1' + (interval4.interval === -1 ? ' d-none' : '')}
              variant='primary'
            >
              Easy {interval4.interval.toString() + (interval4.isMinute ? 'm' : 'd')}
            </Button>
          </div>
          <div className='btn-group float-right'>
            <Collapse in={optionButtonsExpanded} id='collapse-buttons-manager'>
              <div id='collapse-buttons'>
                <Button
                  onClick={deleteFlashCardHandler}
                  className='mr-1'
                  variant='danger'
                >
                  Delete
                </Button>
                <Button
                  onClick={leechsuspendFlashCardGenerator(
                    currentCard.is_leech ? 'unleech' : 'leech'
                  )}
                  className='mr-1'
                  variant='warning'
                >
                  {currentCard.is_leech ? 'Unmark as leech' : 'Mark as leech'}
                </Button>
                <Button
                  onClick={leechsuspendFlashCardGenerator('suspend')}
                  className='mr-1'
                  variant='warning'
                >
                  Suspend
                </Button>
                <Button
                  href={`/decks/${currentCard.parent_deck_id}/flashcards/${currentCard.id}/edit/`}
                  className='mr-1'
                  variant='success'
                >
                  Edit
                </Button>
              </div>
            </Collapse>
            <Button
              onClick={() => setOptionButtonsExpanded(!optionButtonsExpanded)}
              aria-controls='collapse-buttons'
              aria-expanded={optionButtonsExpanded}
              className='mr-1'
              style={{background: 'none', border: 'none'}}
            >
              <i className='fas fa-bars' style={{color: 'black'}} />
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
};