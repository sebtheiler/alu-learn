import React, {useMemo, useState} from 'react';
import {Slate} from 'slate-react';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';

export function StandardNoteEditor(props) {
  const {initialValue, isViewing, onChangeCallback, saveHandler, didTypeCallback} = props;

  const [value, setValue] = useState(initialValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => {
        setValue(newValue);
        onChangeCallback(newValue);
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
  );
};
