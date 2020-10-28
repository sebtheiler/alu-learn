import React, {useEffect, useState, useMemo} from 'react';
import {getAnkiInterval} from './algorithm';
import {Button, Collapse, Alert} from 'react-bootstrap';
import {createFullEditor, FullEditor} from '../../notes/editor-components';
import {Slate} from 'slate-react';
import { emptyValue } from '../../notes/autonote/autonote';
import {Transforms} from 'slate';

// Does some magic with SlateJS that prevents weird errors
// DO NOT REMOVE
// @refresh reset

const processFront = (flashcard, showAnswer) => {
  switch (flashcard.flashcard_type) {
    case 'basic': case 'reversed':
      return flashcard.deck_fields[0].text;
    case 'cloze':
      const currentCardText = JSON.stringify(flashcard.deck_fields[0].text);
      const targetClozeNum = parseInt(flashcard.name.split('-')[1]);
      const regex = /{{c\d*::.*?}}/gm;
      const str = JSON.stringify(flashcard.deck_fields[0].text);
      
      let answerHiddenText = currentCardText;
      let answerRevealedText = currentCardText;
      let m;
      while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        };
        
        // The result can be accessed through the `m`-variable.
        // eslint-disable-next-line
        m.forEach(match => {
          const clozeMatch = str.slice(m.index, m.index + match.length);
          const clozeMatchNum = parseInt(clozeMatch.split('::')[0].slice(3));
          const clozeMatchText = clozeMatch.split('::').slice(1).join('').slice(0, -2);
          if (clozeMatchNum === targetClozeNum) {
            answerHiddenText = answerHiddenText.replace(clozeMatch, '[ ... ]'); // obfuscate
            answerRevealedText = answerRevealedText.replace(clozeMatch, `${clozeMatchText}`); // reveal
          } else {
            answerHiddenText = answerHiddenText.replace(clozeMatch, clozeMatchText);
            answerRevealedText = answerRevealedText.replace(clozeMatch, clozeMatchText);
          };
        });
      };

      answerHiddenText = JSON.parse(answerHiddenText);
      answerRevealedText = JSON.parse(answerRevealedText);

      return showAnswer ? answerRevealedText : answerHiddenText;
    default:
      return emptyValue;
  };
};

function RenderFlashCardStudy(props) {
  const {flashcard, showAnswer} = props;

  const [frontValue, setFrontValue] = useState(processFront(flashcard, showAnswer));
  const frontEditor = useMemo(
    () => createFullEditor(),
    []
  );
  const [backValue, setBackValue] = useState(flashcard.deck_fields.length > 1 && flashcard.deck_fields[1].text);
  const backEditor = useMemo(
    () => createFullEditor(),
    []
  );

  useEffect(() => {
    // Slate is lazy and won't automatically update the editor when the flashcard
    // prop is changed, so we manually have to check if it has changed
    // The frontValue dependency is excluded on purpose - including it causes infinite loop
    if (processFront(flashcard, showAnswer) !== frontValue) {
      setFrontValue(processFront(flashcard, showAnswer));
      setBackValue(flashcard.deck_fields.length > 1 && flashcard.deck_fields[1].text);
    };
    // eslint-disable-next-line
  }, [flashcard, showAnswer]);

  Transforms.move(backEditor, { edge: 'anchor', distance: 9999999, reverse: true });
  Transforms.move(backEditor, { edge: 'focus', distance: 9999999, reverse: true });
  Transforms.move(frontEditor, { edge: 'anchor', distance: 9999999, reverse: true });
  Transforms.move(frontEditor, { edge: 'focus', distance: 9999999, reverse: true });

  switch (flashcard.flashcard_type) {
    case 'basic': case 'reversed':
      return (<>
        <div className='col-md-12 text-center' style={{ minWidth: '200px' }}>
          <Slate
            editor={frontEditor}
            value={frontValue}
            onChange={newValue => {
              setFrontValue(newValue);
            }}
          >
            <FullEditor
              editor={frontEditor}
              styleOptions={{ showBorder: false, minHeight: '0px' }}
              readOnly
            />
          </Slate>
        </div>
        <hr />
        <div className='col-md-12 text-center' style={{ minWidth: '200px' }}>
          {flashcard && showAnswer &&
            <Slate
              editor={backEditor}
              value={backValue}
              onChange={newValue => {
                setBackValue(newValue);
              }}
            >
              <FullEditor
                editor={backEditor}
                readOnly={true}
                styleOptions={{ showBorder: false, minHeight: '0px' }}
              />
            </Slate>
          }
        </div>
      </>);
    case 'cloze':
      return (
        <div className='col-md-12 text-center' style={{ minWidth: '200px' }}>
          <Slate
            editor={frontEditor}
            value={processFront(flashcard, showAnswer)}
            onChange={newValue => {
              setFrontValue(newValue);
            }}
          >
            <FullEditor
              editor={frontEditor}
              styleOptions={{ showBorder: false, minHeight: '0px' }}
              readOnly
            />
          </Slate>
        </div>
      );
    default:
      return (
        <div className='col-md-12 text-center' style={{minWidth: '200px'}}>
          <strong>The flashcard type, "{flashcard.flashcard_type}", is unrecognized. Please report this issue.</strong>
        </div>
      );
  };
};


export function StudyElement(props) {
  const {currentCard, showAnswer, showAnswerHandler, message, backendGradeUpdate, handleKeyDown, schedulingAlgorithm, deleteFlashCardHandler, leechsuspendFlashCardGenerator, numRemainingFlashcards} = props;
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
  
  // This could be optimized, but it really isn't worth it at the moment
  const interval1 = getAnkiInterval(currentCard, 1, schedulingAlgorithm);
  const interval2 = getAnkiInterval(currentCard, 2, schedulingAlgorithm);
  const interval3 = getAnkiInterval(currentCard, 3, schedulingAlgorithm);
  const interval4 = getAnkiInterval(currentCard, 4, schedulingAlgorithm);

  if (currentCard === null) {
    return <>Loading...</>;
  };

  return (
    <>
      <RenderFlashCardStudy flashcard={currentCard} showAnswer={showAnswer} />
      <footer className='fixed-bottom mb-5'>
        <div className='mb-5'>
          <div className={'col-md-12 text-center btn-group mb-1' + (showAnswer || currentCard === null ? ' d-none' : '')}>
            <Button onClick={showAnswerHandler} id='showanswer'>Show Answer</Button>
          </div>
          <div className={'col-md-12 text-center btn-group mb-1' + (!showAnswer ? ' d-none' : '')}>
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
            <p className='mr-2' style={{transform: 'translate(-2px, 6px)'}}>
              {numRemainingFlashcards} flashcards remaining
            </p>
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
                  href={`/decks/${currentCard.parent_deck_id}/flashcards/${currentCard.creator_id}/edit/`}
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
          {message ? <div className='float-left'>
            <Alert variant={message.variant} className='ml-3'>
              {message.content}
            </Alert>
          </div> : null}
        </div>
      </footer>
    </>
  );
};