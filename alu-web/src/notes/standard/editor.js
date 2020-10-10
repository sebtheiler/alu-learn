import React, {useMemo, useState} from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {Slate} from 'slate-react';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import {AutoNoteModal} from '../autonote';
import { QuestionBubble } from '../../utils';

export function StandardNoteEditor(props) {
  const {initialValue, isViewing, updateValueToSave, saveHandler, didTypeCallback, noteId} = props;
  const [showAutoNoteModal, setShowAutoNoteModal] = useState(false);

  const [value, setValue] = useState(initialValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

  return (<>
    <ButtonGroup>
      {!isViewing && <Button
        onClick={(event) => {event.preventDefault(); setShowAutoNoteModal(true)}}
        variant='success'
        className='mt-0 mb-2'
      >
        Import Text Document
      </Button>}
      <Button
        href={`/notes/create-flashcards/${noteId}`}
        variant='success'
        className='mt-0 mb-2 ml-1'
      >
        Create Flashcards from This Document
      </Button>
    </ButtonGroup>
    <AutoNoteModal
      show={showAutoNoteModal}
      hide={() => setShowAutoNoteModal(false)}
      updateNoteCallback={(newValue) => {
        setValue(newValue);
        updateValueToSave({ content: newValue });
        didTypeCallback();
      }}
      initialValue={value}
    />
    {navigator.userAgent.toLowerCase().includes('firefox') && <>
      <br />
      <small className='text-danger'>
        Auto-correct is currently broken on Firefox.
        {' '}
        <QuestionBubble>
          We truly apologize about this,
          however, our backend text editor's
          auto-correct does not work in Firefox.
          We hope to support Firefox as soon as possible,
          but for the time being you can switch to a
          Chrome-based browser (Google Chrome, Brave, etc.)
          for autocorrect capabilities.
        </QuestionBubble>
      </small>
    </>}
    <br />
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue);
        updateValueToSave({ content: newValue });
        didTypeCallback();
      }}
    >
      {!isViewing &&
        <EditorButtons
          editor={editor}
          saveHandler={saveHandler}
        />
      }
      <hr />
      <FullEditor
        editor={editor}
        readOnly={isViewing}
        didTypeCallback={didTypeCallback}
      />
    </Slate>
  </>);
};
