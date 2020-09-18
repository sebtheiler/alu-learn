import React, {useMemo, useState} from 'react';
import { Button } from 'react-bootstrap';
import {Slate} from 'slate-react';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import './editor.css';

const basicValue = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": "Text..."
      }
    ]
  }
]

export function CornellNoteEditor(props) {
  const {initialValue, isViewing, onChangeCallback, saveHandler, didTypeCallback} = props;
  const [sections, setSections] = useState([
    { cue: basicValue, content: basicValue },
    { cue: basicValue, content: basicValue },
    { cue: basicValue, content: basicValue },
    { cue: basicValue, content: basicValue },
    { cue: basicValue, content: basicValue },
  ]);

  const [summaryValue, setSummaryValue] = useState(basicValue);
  const summaryEditor = useMemo(
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
        {sections.map((value, index) => 
          <tr key={`section-${index}`}>
            <CornellSection initialValue={value} />
          </tr>
        )}
        <tr>
          <td colSpan='2' className='summary'>
            <Button onClick={event => {
              event.preventDefault();
              setSections([...sections, {
                cue: basicValue, content: basicValue
              }]);
            }}
            className='m-3'
            >
              Create new Section
            </Button>
          </td>
        </tr>
        <tr>
          <td colSpan='2' className='summary'>
            <Slate
              editor={summaryEditor}
              value={summaryValue}
              onChange={newValue => {
                setSummaryValue(newValue);
              }}
            >
              <FullEditor
                editor={summaryEditor}
                didTypeCallback={() => {}}
                styleOptions={{ showBorder: false, minHeight: '250px' }}
              />
            </Slate>
          </td>
        </tr>
      </tbody>
    </table>
  );
};


function CornellSection(props) {
  const {initialValue} = props;

  const [cueValue, setCueValue] = useState(initialValue.cue);
  const cueEditor = useMemo(
    () => createFullEditor(),
    []
  );

  const [contentValue, setContentValue] = useState(initialValue.content);
  const contentEditor = useMemo(
    () => createFullEditor(),
    []
  );

  return (<>
    <td className='cue'>
      <Slate
        editor={cueEditor}
        value={cueValue}
        onChange={newValue => {
          setCueValue(newValue);
          // onChangeCallback(newValue);
        }}
      >
        <FullEditor
          editor={cueEditor}
          // readOnly={isViewing}
          didTypeCallback={() => {}}
          styleOptions={{ showBorder: false, minHeight: '175px' }}
        />
      </Slate>
    </td>
    <td className='content'>
      <Slate
        editor={contentEditor}
        value={contentValue}
        onChange={newValue => {
          setContentValue(newValue);
        }}
      >
        <FullEditor
          editor={contentEditor}
          didTypeCallback={() => {}}
          styleOptions={{ showBorder: false, minHeight: '175px' }}
        />
      </Slate>
    </td>
  </>);
};