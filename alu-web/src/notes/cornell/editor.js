import React, {useMemo, useState} from 'react';
import { Button } from 'react-bootstrap';
import {Slate} from 'slate-react';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import './editor.css';

export function CornellNoteEditor(props) {
  const {initialValue, isViewing, onChangeCallback, saveHandler, didTypeCallback} = props;
  const [sections, setSections] = useState([
    { cue: "Cue #1", content: "Note #1" },
    { cue: "Cue #2", content: "Note #2" },
    { cue: "Cue #3", content: "Note #3" },
    { cue: "Cue #4", content: "Note #4" },
    { cue: "Cue #5", content: "Note #5" },
  ]);

  // const [value, setValue] = useState(initialValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );

  return (
    <table>
      <thead>
        <tr>
          <th>Cues</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {sections.map(({ cue, content }, index) => { return (
          <tr key={`section-${index}`}>
            <td className='cue'>{cue}</td>
            <td className='content'>{content}</td>
          </tr>
        )})}
        <tr>
          <td colSpan='2' className='summary'>
            <Button onClick={event => {
              event.preventDefault();
              setSections([...sections, {
                cue: 'New Section', content: 'Notes...'
              }]);
            }}>
              Create new Section
            </Button>
          </td>
        </tr>
        <tr>
          <td colSpan='2' className='summary'>
            Summary
          </td>
        </tr>
      </tbody>
    </table>
    // <Slate
    //   editor={editor}
    //   value={value}
    //   onChange={newValue => {
    //     setValue(newValue);
    //     onChangeCallback(newValue);
    //   }}
    // >
    //   {!isViewing &&
    //     <EditorButtons
    //       editor={editor}
    //       saveHandler={saveHandler}
    //     />
    //   }
    //   <hr />
    //   <FullEditor
    //     editor={editor}
    //     readOnly={isViewing}
    //     didTypeCallback={didTypeCallback}
    //   />
    // </Slate>
  );
};
