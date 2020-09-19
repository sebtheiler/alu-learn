import React, {useMemo, useState} from 'react';
import { Button } from 'react-bootstrap';
import {Slate} from 'slate-react';
import {createFullEditor, FullEditor} from '../editor-components';
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
  const {initialValue, isViewing, updateValueToSave, saveHandler, didTypeCallback} = props;
  const [sections, setSections] = useState(initialValue.sections);
  const [summaryValue, setSummaryValue] = useState(initialValue.summary);
  const summaryEditor = useMemo(
    () => createFullEditor(),
    []
  );

  const onChangeCallback = (newSections) => {
    updateValueToSave({
      sections: newSections ? newSections : sections,
      summary: summaryValue,
    });
  };

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
            <CornellSection
              value={value}
              isViewing={isViewing}
              didTypeCallback={didTypeCallback}
              onChangeCallback={onChangeCallback}
              updateCue={newValue => {
                setSections([...sections.slice(0, index),
                  {content: sections[index].content, cue: newValue},
                ...sections.slice(index+1, sections.length)]);
              }}
              updateContent={newValue => {
                setSections([...sections.slice(0, index),
                  {cue: sections[index].cue, content: newValue},
                ...sections.slice(index+1, sections.length)]);
              }}
            />
          </tr>
        )}
        <tr>
          <td colSpan='2' className='summary'>
            <Button onClick={event => {
              event.preventDefault();
              const newSections = [...sections, {
                cue: basicValue, content: basicValue
              }];
              setSections(newSections);
              onChangeCallback(newSections);
              didTypeCallback();
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
                readOnly={isViewing}
                didTypeCallback={didTypeCallback}
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
  const {value, updateContent, updateCue, didTypeCallback, onChangeCallback, isViewing} = props;

  const styleOptions = { showBorder: false, minHeight: '175px' };
  const cueEditor = useMemo(
    () => createFullEditor(),
    []
  );
  const contentEditor = useMemo(
    () => createFullEditor(),
    []
  );

  return (<>
    <td className='cue'>
      <Slate
        editor={cueEditor}
        value={value.cue}
        onChange={newValue => {
          updateCue(newValue);
          onChangeCallback();
        }}
      >
        <FullEditor
          editor={cueEditor}
          readOnly={isViewing}
          didTypeCallback={didTypeCallback}
          styleOptions={styleOptions}
        />
      </Slate>
    </td>
    <td className='content'>
      <Slate
        editor={contentEditor}
        value={value.content}
        onChange={newValue => {
          updateContent(newValue);
          onChangeCallback();
        }}
      >
        <FullEditor
          editor={contentEditor}
          readOnly={isViewing}
          didTypeCallback={didTypeCallback}
          styleOptions={styleOptions}
        />
      </Slate>
    </td>
  </>);
};