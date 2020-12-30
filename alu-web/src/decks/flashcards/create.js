import React, { useState, useMemo } from 'react';
import { apiFlashCardCreate, apiFlashCardEdit, apiFlashCardDetail } from '../../lookup';
import { Button, Form, OverlayTrigger } from 'react-bootstrap';
import { generateTooltip, errorHandler, QuestionBubble } from '../../utils';
import { createFullEditor, EditorButtons, FullEditor } from '../../notes/editor-components';
import { emptyValue } from '../../notes/autonote/autonote';
import { Slate, ReactEditor } from 'slate-react';
import { Transforms } from 'slate';

function FreezeOverlay(props) {
  return (
    <OverlayTrigger
      overlay={generateTooltip(
        `You can freeze a field to keep its value the same after creating your flashcard.
        Useful for creating multiple similar flashcards. Learn more [here](/help/freezing-fields/).`
        )}
        placement='right'
        delay={{ show: 300, hide: 1800 }}
        >
      {props.children}
    </OverlayTrigger>
  );
}

// Function for card create form
export function FlashCardCreate(props) {
  const [frontValue, setFrontValue] = useState(emptyValue);
  const frontEditor = useMemo(
    () => createFullEditor(),
    []
  );
  const [backValue, setBackValue] = useState(emptyValue);
  const backEditor = useMemo(
    () => createFullEditor(),
    []
  );
  // `deckId`: ID of the deck in which to create flashcard
  // `returnToPreviousPage`: If true, redirect the user to the previous page (used for editing)
  // `flashcardId`: If not null/undefined, the ID of the flashcard to EDIT
  const {deckId, returnToPreviousPage, flashcardId} = props;
  const [btnLabel, setBtnLabel] = useState(isNaN(flashcardId) ? 'Create' : 'Save');
  const [flashcardType, setFlashCardType] = useState('basic');
  const [gotFlashcardDetail, setGotFlashcardDetail] = useState(false);

  const [freezeFront, setFreezeFront] = useState(false);
  const [freezeBack, setFreezeBack] = useState(false);
  const [freezeTags, setFreezeTags] = useState(true);

  // Warn user before leaving page (adapted from https://stackoverflow.com/a/7317311)
  window.addEventListener("beforeunload", () => {});

  // If we are editing a card, get its current values
  useState(() => {
    if (gotFlashcardDetail === false) {
      setGotFlashcardDetail(true);
      if (isNaN(flashcardId) === false) {
        apiFlashCardDetail(deckId, flashcardId, (response, status) => {
          if (status === 200) {
            switch (response.flashcard_type) {
              case 'basic': case 'reversed':
                setFrontValue(response.deck_fields[0].text);
                setBackValue(response.deck_fields[1].text);
                break;
              case 'cloze':
                setFrontValue(response.deck_fields[0].text);
                break;
              default:
                return;
            }
            document.getElementById('tags').value = response.tags;
            setFlashCardType(response.flashcard_type);
          } else {
            // Error getting flashcard detail
            errorHandler(response, status, 2000);
          }
        });
      }
    }
  });

  // Called after the request is sent to the backend to create or edit a flashcard
  const handleBackendUpdate = (response, status) => {
    setBtnLabel(isNaN(flashcardId) ? 'Create' : 'Save');
    if (status === 201 || status === 200) {
      // If the user should be redirected, redirect them
      if (returnToPreviousPage) {
        window.history.back();
      } else if (isNaN(flashcardId)) {
        // Make the textareas empty
        Transforms.move(backEditor, { edge: 'anchor', distance: 9999999, reverse: true });
        Transforms.move(backEditor, { edge: 'focus', distance: 9999999, reverse: true });
        Transforms.move(frontEditor, { edge: 'anchor', distance: 9999999, reverse: true });
        Transforms.move(frontEditor, { edge: 'focus', distance: 9999999, reverse: true });
        ReactEditor.focus(frontEditor);
        if (!freezeFront) setFrontValue(emptyValue);
        if (!freezeBack) setBackValue(emptyValue);
        if (!freezeTags) document.getElementById('tags').value = '';
        Transforms.move(frontEditor, { edge: 'anchor', distance: 9999999 });
        Transforms.move(frontEditor, { edge: 'focus', distance: 9999999 });
        document.getElementById('flashcardType').focus()
      }
    } else {
      // Error creating/editing flashcard
      errorHandler(response, status, 2001);
    }
  }

  // Called when the form is submitted
  // Sends a request to the backend to create a flashcard
  const handleSubmit = (event) => {
    event.preventDefault();
    const content = (() => {switch (flashcardType) {
      case 'basic': case 'reversed':
        return [frontValue, backValue];
      case 'cloze':
        return [frontValue];
      default:
        return [];
    }})();

    if (isNaN(flashcardId) === false) {
      // This implies we are editing a card
      setBtnLabel('Saving...');
      apiFlashCardEdit(
        deckId,
        flashcardId,
        content,
        document.getElementById('tags').value,
        handleBackendUpdate,
      );
    } else {
      // This implies we are creating a card
      setBtnLabel('Creating...');
      apiFlashCardCreate(
        deckId,
        content,
        document.getElementById('tags').value,
        flashcardType,
        handleBackendUpdate,
      );
    }
  }

  return (
    <div className={props.className}>
      <Form onSubmit={handleSubmit}>
        {!returnToPreviousPage && <Form.Group>
          <Form.Label>Flashcard Type</Form.Label>
          <Form.Control
            as='select'
            onChange={event => setFlashCardType(event.target.value)}
            id='flashcardType'
            autofocus
            custom
          >
            <option value='basic'>Basic</option>
            <option value='reversed'>Basic and Reversed</option>
            <option value='cloze'>Cloze</option>
          </Form.Control>
        </Form.Group>}
        <Form.Group className='blue-border-focus'>
          <Form.Label htmlFor='frontText' className='mb-0 mt-3 w-100'>
            <p className='mb-1'>
            {!returnToPreviousPage && <FreezeOverlay><i
                className='far fa-snowflake mb-1 mr-1 fa-lg'
                onClick={event => {event.preventDefault(); setFreezeFront(!freezeFront)}}
                style={{ cursor: 'pointer', color: freezeFront ? '#89ACFF' : '#6C757D' }}
              /></FreezeOverlay>}
              Front
            </p>
          </Form.Label>
          <div style={{ borderStyle: 'solid', borderWidth: '1px', paddingTop: '5px', paddingLeft: '5px' }}>
            <Slate
              editor={frontEditor}
              value={frontValue}
              onChange={newValue => {
                setFrontValue(newValue);
              }}
            >
              <EditorButtons
                editor={frontEditor}
                untabbable
              />
              <FullEditor
                id='frontText'
                editor={frontEditor}
                styleOptions={{ minHeight: '200px' }}
              />
            </Slate>
          </div>
          {['cloze'].includes(flashcardType) === false && <>
            <Form.Label htmlFor='backText' className='mb-0 mt-3 w-100'>
              <p className='mb-0'>
                {!returnToPreviousPage && <FreezeOverlay><i
                  className='far fa-snowflake mb-1 mr-1 fa-lg'
                  onClick={event => {event.preventDefault(); setFreezeBack(!freezeBack)}}
                  style={{cursor: 'pointer', color: freezeBack ? '#89ACFF' : '#6C757D'}}
                /></FreezeOverlay>}
                Back
              </p>
            </Form.Label>
            <div style={{ borderStyle: 'solid', borderWidth: '1px', paddingTop: '5px', paddingLeft: '5px' }}>
              <Slate
                editor={backEditor}
                value={backValue}
                onChange={newValue => {
                  setBackValue(newValue);
                }}
              >
                <EditorButtons
                  editor={backEditor}
                  untabbable
                />
                <FullEditor
                  editor={backEditor}
                  styleOptions={{ minHeight: '200px' }}
                />
              </Slate>
            </div>
          </>}
        </Form.Group>
        <Form.Group>
          <Form.Label htmlFor='tags' className='mb-0 w-100'>
            <p className='mb-0'>
              {returnToPreviousPage ? null : <FreezeOverlay><i
                className='far fa-snowflake mb-1 mr-1 fa-lg'
                onClick={event => {event.preventDefault(); setFreezeTags(!freezeTags)}}
                style={{cursor: 'pointer', color: freezeTags ? '#89ACFF' : '#6C757D'}}
              /></FreezeOverlay>}
              Tags (separate with commas){' '}
              <QuestionBubble>
                You can give your flashcards tags to group them together.
                Learn more [here](/help/flashcard-tags/).
              </QuestionBubble>
            </p>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder='Calculus, Integrals, Exponentials, ...'
            id='tags' name='tags'
            maxLength='1024'
          />
        </Form.Group>
        <Form.Group className='text-center mt-1'>
          <Button type='submit' variant='primary' block>{btnLabel}</Button>
        </Form.Group>
      </Form>
    </div>
  );
}
