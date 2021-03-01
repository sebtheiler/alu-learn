import React, { useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { Slate } from 'slate-react';
import { createFullEditor, EditorButtons, FullEditor } from '../editor-components';
import { AutoNoteModal } from '../autonote';
import { QuestionBubble } from '../../utils';
import { Node } from 'slate';

interface StandardNoteEditorProps {
  initialValue: {
    content: Node[];
  };
  isViewing: boolean;
  updateValueToSave(newValue: { content: Node[] }): void;
  saveHandler(): void;
  didTypeCallback(): void;
  noteId: number;
  pageNum: number;
}
export function StandardNoteEditor(props: StandardNoteEditorProps) {
  const { initialValue, isViewing, updateValueToSave, saveHandler, didTypeCallback, noteId, pageNum } = props;
  const [showAutoNoteModal, setShowAutoNoteModal] = useState(false);

  const [value, setValue] = useState(initialValue.content);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

  return (<>
    <ButtonGroup>
      {!isViewing && <Button
        onClick={(event) => {event.preventDefault(); setShowAutoNoteModal(true)}}
        variant='success'
        className='mt-0 mb-2 mr-1'
      >
        Import Text Document
      </Button>}
      <Button
        href={`/notes/create-flashcards/${noteId}/page/${pageNum ?? 1}/`}
        variant='success'
        className='mt-0 mb-2'
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
        if (newValue !== value) {
          didTypeCallback();
        }
        setValue(newValue);
        updateValueToSave({ content: newValue });
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
      />
    </Slate>
  </>);
}
