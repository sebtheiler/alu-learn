import React, {useMemo, useState} from 'react';
import {Button} from 'react-bootstrap';
import {Slate} from 'slate-react';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import {AutoNoteModal} from '../autonote';

export function StandardNoteEditor(props) {
  const {initialValue, isViewing, updateValueToSave, saveHandler, didTypeCallback} = props;
  const [showAutoNoteModal, setShowAutoNoteModal] = useState(false);

  const [value, setValue] = useState(initialValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

  return (<>
    <Button
      onClick={(event) => {event.preventDefault(); setShowAutoNoteModal(true)}}
      variant='success'
      className='mt-0 mb-2'
    >
      Import Text Document
    </Button>
    <AutoNoteModal
      show={showAutoNoteModal}
      hide={() => setShowAutoNoteModal(false)}
      updateNoteCallback={(newValue) => setValue(newValue)}
    />
    <br />
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
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
        didTypeCallback={didTypeCallback}
      />
    </Slate>
  </>);
};
