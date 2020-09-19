import React, {useMemo, useRef, useState} from 'react';
import { Button, Overlay, OverlayTrigger, Popover } from 'react-bootstrap';
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

  const deleteHandler = (index) => {
    return (event) => {
      event.preventDefault();
      const newSections = [...sections.slice(0, index),
        // Index is removed
      ...sections.slice(index+1, sections.length)]
      setSections(newSections);
      document.body.click();
      onChangeCallback(newSections);
      didTypeCallback();
    };
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Cues</th>
          <th>Notes</th>
        </tr>
      </thead>
      <colgroup>
        <col style={{ width: '25%' }} />
        <col style={{ width: '75%' }} />
      </colgroup>
      <tbody>
        {sections.map((value, index) => 
          <tr key={`section-${index}`}>
            <CornellSection
              value={value}
              isViewing={isViewing}
              didTypeCallback={didTypeCallback}
              onChangeCallback={onChangeCallback}
              deleteHandler={deleteHandler(index)}
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
  const {value, updateContent, updateCue, didTypeCallback, onChangeCallback, isViewing, deleteHandler} = props;

  const styleOptions = { showBorder: false, minHeight: '175px' };
  const cueEditor = useMemo(
    () => createFullEditor(),
    []
  );
  const contentEditor = useMemo(
    () => createFullEditor(),
    []
  );

  const deletePopover = (
    <Popover>
      <Popover.Title as='h3'>Delete Section</Popover.Title>
      <Popover.Content>
        Please confirm that you want to delete this section. This action is IRREVERSIBLE.
        Only continue if you are absolutely sure you do not want this section.
        <Button
          variant='danger'
          className='mt-2'
          onClick={deleteHandler}
          block
        >
          Permanently Delete Section
        </Button>
      </Popover.Content>
    </Popover>
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
        <OverlayTrigger trigger='click' placement='bottom' overlay={deletePopover} rootClose>
          <Button
            style={{
              background: 'none',
              border: 'none',
              float: 'right'
            }}
          >
            <i className='far fa-trash-alt fa-sm' style={{ padding: '0', color: '#dc3545' }} />
          </Button>
        </OverlayTrigger>
        <br />
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