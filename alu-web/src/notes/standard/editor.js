import React, {useMemo, useState} from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import {Slate} from 'slate-react';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import {AutoNoteModal} from '../autonote';

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
