import React, { useState, useMemo, useRef } from 'react';
import { apiFlashCardCreate, apiFlashCardEdit, apiFlashCardDetail } from '../../lookup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { generateTooltip, errorHandler, QuestionBubble } from '../../utils';
import { createFullEditor, EditorButtons, FullEditor } from '../../notes/editor-components';
import { emptyValue } from '../../notes/autonote/autonote';
import { Slate, ReactEditor } from 'slate-react';
import { Node, Transforms } from 'slate';
import { FlashCardCreator, FlashCardTypes } from '../types';

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
interface FlashCardCreateProps {
  deckId: number;
  returnToPreviousPage?: boolean;
  flashcardNum?: string;
  className?: string;
}
export function FlashCardCreate(props: FlashCardCreateProps) {
  const {deckId, returnToPreviousPage, flashcardNum} = props;
  const [frontValue, setFrontValue] = useState<Node[]>(emptyValue);
  const frontEditor = useMemo<ReactEditor>(
    () => createFullEditor(),
    []
  );
  const [backValue, setBackValue] = useState<Node[]>(emptyValue);
  const backEditor = useMemo<ReactEditor>(
    () => createFullEditor(),
    []
  );
  const [btnLabel, setBtnLabel] = useState((flashcardNum && flashcardNum !== 'None') ? 'Save' : 'Create');
  const [flashcardType, setFlashCardType] = useState<FlashCardTypes>('basic');
  const [gotFlashcardDetail, setGotFlashcardDetail] = useState(false);
  const [createdFlashcards, setCreatedFlashcards] = useState<FlashCardCreator[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const tagsRef = useRef<HTMLInputElement>(document.createElement('input'));

  const [freezeFront, setFreezeFront] = useState(false);
  const [freezeBack, setFreezeBack] = useState(false);
  const [freezeTags, setFreezeTags] = useState(true);

  // Warn user before leaving page (adapted from https://stackoverflow.com/a/7317311)
  window.addEventListener("beforeunload", () => {});

  // If we are editing a card, get its current values
  useState(() => {
    if (gotFlashcardDetail === false) {
      setGotFlashcardDetail(true);
      if (flashcardNum && flashcardNum !== 'None') {
        apiFlashCardDetail(deckId, flashcardNum, (response, status) => {
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
            if (tagsRef) tagsRef.current.value = response.tags;
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
  const handleBackendUpdate = (response: FlashCardCreator, status: number) => {
    setBtnLabel(flashcardNum ? 'Save' : 'Create');
    if (status === 201 || status === 200) {
      // If the user should be redirected, redirect them
      if (returnToPreviousPage) {
        window.history.back();
      } else if (!flashcardNum || flashcardNum === 'None') {
        // Make the textareas empty
        Transforms.move(backEditor, { edge: 'anchor', distance: 9999999, reverse: true });
        Transforms.move(backEditor, { edge: 'focus', distance: 9999999, reverse: true });
        Transforms.move(frontEditor, { edge: 'anchor', distance: 9999999, reverse: true });
        Transforms.move(frontEditor, { edge: 'focus', distance: 9999999, reverse: true });
        ReactEditor.focus(frontEditor);
        if (!freezeFront) setFrontValue(emptyValue);
        if (!freezeBack) setBackValue(emptyValue);
        if (!freezeTags) tagsRef.current.value = '';
        Transforms.move(frontEditor, { edge: 'anchor', distance: 9999999 });
        Transforms.move(frontEditor, { edge: 'focus', distance: 9999999 });
        const flashcardTypeEl = document.getElementById('flashcardType');
        if (flashcardTypeEl) flashcardTypeEl.focus()

        // Add flashcard to list of created flashcards
        setCreatedFlashcards([...createdFlashcards, response[0]]);
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

    // Check if the flashcard is valid
    switch (flashcardType) {
      case 'basic': case 'reversed':
        if (frontValue === emptyValue || backValue === emptyValue) {
          setErrorMessage('The front and back of flashcards must not be empty');
          return;
        }
        break;
      case 'cloze':
        const clozeRegex = /{{c\d*::.*?}}/gm;
        const match = JSON.stringify(frontValue).match(clozeRegex);
        if (!match) {
          setErrorMessage('Cloze flashcards must have at least one instance of a cloze deletion');
          return;
        }
        break;
      default:
        break;
    }
    setErrorMessage('');

    if (flashcardNum && flashcardNum !== 'None') {
      // This implies we are editing a card
      setBtnLabel('Saving...');
      apiFlashCardEdit(
        deckId,
        flashcardNum,
        content,
        tagsRef.current.value.toLowerCase(),
        handleBackendUpdate,
      );
    } else {
      // This implies we are creating a card
      setBtnLabel('Creating...');
      apiFlashCardCreate(
        deckId,
        content,
        tagsRef.current.value.toLowerCase(),
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
            onChange={event => setFlashCardType(event.target.value as FlashCardTypes)}
            id='flashcardType'
            autoFocus
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
                  id='backText'
                  editor={backEditor}
                  styleOptions={{ minHeight: '200px' }}
                />
              </Slate>
            </div>
          </>}
        </Form.Group>
        <Form.Group>
          <Form.Label
            htmlFor='tags'
            className='mb-0 w-100'
            style={{ textTransform: 'lowercase' }}
          >
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
            placeholder='unit 1, unit 1.1, europe, people, ...'
            id='tags' name='tags'
            ref={tagsRef}
            maxLength={1024}
          />
        </Form.Group>
        <Form.Group className='text-center mt-1'>
          <p className='text-center text-danger'>{errorMessage}</p>
          <Button
            type='submit'
            variant='primary'
            id='create'
            block
          >
            {btnLabel}
          </Button>
        </Form.Group>
        {(!flashcardNum && flashcardNum !== 'None') && <Form.Group>
          <Form.Label htmlFor='history'>History</Form.Label><br />
          <Form.Control
            as='select'
            name='history'
            style={{ maxWidth: '300px' }}
            onChange={event => {
              const target = event.target as HTMLSelectElement;
              // Get selected value and open new page editing that flashcard
              const flashcardNum = parseInt(target.options[target.selectedIndex].value);
              if (flashcardNum >= 0) {
                window.open(`/decks/${deckId}/flashcards/${flashcardNum}/edit/`);
              }
            }}
            custom
          >
            <option value='-1'>-----</option>
            {createdFlashcards.map((flashcard, i) =>
              <option key={i} value={flashcard.flashcard_num}>
                {(flashcard.deck_fields[0].text[0] as any).children[0].text.slice(0, 20)}...
              </option>
            )}
          </Form.Control>
        </Form.Group>}
        <Button
          href={`/decks/${deckId}/flashcards/`}
          target='_blank'
          className='mb-3'
          id='browse-deck-btn'
        >
          Browse
        </Button>
      </Form>
    </div>
  );
}
