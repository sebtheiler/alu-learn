import React, { useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { Node } from 'slate';
import { Slate } from 'slate-react';
import { QuestionBubble } from '../../utils';
import { createFullEditor, EditorButtons, FullEditor } from '../editor-components';
import { CornellSectionInterface } from '../types';
import './editor.css';

const basicValue = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": ""
      }
    ]
  }
];

interface CornellNoteProps {
  initialValue: {
    sections: CornellSectionInterface[];
    summary: Node[];
  };
  isViewing: boolean;
  updateValueToSave(newValue: { sections: CornellSectionInterface[], summary: Node[] }): void;
  saveHandler(): void;
  didTypeCallback(): void;
}
export function CornellNoteEditor(props: CornellNoteProps) {
  const { initialValue, isViewing, updateValueToSave, saveHandler, didTypeCallback } = props;
  const [sections, setSections] = useState(initialValue.sections);
  const [summaryValue, setSummaryValue] = useState(initialValue.summary);
  const summaryEditor = useMemo(
    () => createFullEditor(),
    []
  );

  // Update what is going to be saved
  // This is needed, because of the way re-renders
  // and state changes work
  const updateAllSectionsCallback = (newSections?: CornellSectionInterface[], newSummary?: Node[]) => {
    updateValueToSave({
      sections: newSections ?? sections,
      summary: newSummary ?? summaryValue,
    });
  }

  // Delete a single section
  const sectionDeleteHandler = (index) => {
    return (event) => {
      event.preventDefault();
      const newSections = [...sections.slice(0, index),
        // Index is removed
      ...sections.slice(index + 1, sections.length)];
      setSections(newSections);
      document.body.click(); // remove the popup
      updateAllSectionsCallback(newSections);
      didTypeCallback();
    }
  }

  return (<>
    {!isViewing && <Button className='mb-3' onClick={saveHandler}>
      Save
    </Button>}
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
              deleteHandler={sectionDeleteHandler(index)}
              updateCue={newValue => {
                const newSections: CornellSectionInterface[] =
                  [...sections.slice(0, index),
                    {content: sections[index].content, cue: newValue},
                  ...sections.slice(index+1, sections.length)];
                setSections(newSections);
                updateAllSectionsCallback(newSections);
                didTypeCallback();
              }}
              updateContent={newValue => {
                const newSections: CornellSectionInterface[] =
                  [...sections.slice(0, index),
                    {cue: sections[index].cue, content: newValue},
                  ...sections.slice(index+1, sections.length)];
                setSections(newSections);
                updateAllSectionsCallback(newSections);
                didTypeCallback();
              }}
              moveUp={index !== 0 ? () => {
                [sections[index-1], sections[index]] = [sections[index], sections[index-1]];
                setSections(sections);
                updateAllSectionsCallback(sections);
                didTypeCallback();
              } : undefined}
              moveDown={index !== sections.length - 1 ? () => {
                [sections[index+1], sections[index]] = [sections[index], sections[index+1]];
                setSections(sections);
                updateAllSectionsCallback(sections);
                didTypeCallback();
              } : undefined}
            />
          </tr>
        )}
        {!isViewing && <tr>
          <td colSpan={2}>
            <Button onClick={event => {
              event.preventDefault();
              const newSections = [...sections, {
                cue: basicValue, content: basicValue
              }];
              setSections(newSections);
              updateAllSectionsCallback(newSections);
              didTypeCallback();
            }}
            className='m-3'
            >
              Create new Section
            </Button>
          </td>
        </tr>}
        <tr>
          <td colSpan={2} className='summary'>
            <Slate
              editor={summaryEditor}
              value={summaryValue}
              onChange={newValue => {
                setSummaryValue(newValue);
                if (newValue !== summaryValue) {
                  didTypeCallback();
                  updateAllSectionsCallback(undefined, newValue);
                }
              }}
            >
              {!isViewing && <EditorButtons
                editor={summaryEditor}
                saveHandler={saveHandler}
                className='pl-2 pt-2'
              />}
              <FullEditor
                editor={summaryEditor}
                readOnly={isViewing}
                styleOptions={{ showBorder: false, minHeight: '250px' }}
              />
            </Slate>
          </td>
        </tr>
      </tbody>
    </table>
  </>);
}

// This is used for rendering an individual "section" (cue and note) of the Cornell editor
interface CornellSectionProps {
  value: CornellSectionInterface;
  moveUp?(): void;
  moveDown?(): void;
  updateContent(newValue: Node[]): void;
  updateCue(newValue: Node[]): void;
  isViewing: boolean;
  deleteHandler(event: React.MouseEvent<HTMLInputElement>): void;
}
function CornellSection(props: CornellSectionProps) {
  const { value, moveUp, moveDown, updateContent, updateCue, isViewing, deleteHandler } = props;
  const styleOptions = { showBorder: false, minHeight: '175px' };
  const cueEditor = useMemo(
    () => createFullEditor(),
    []
  );
  const contentEditor = useMemo(
    () => createFullEditor(),
    []
  );

  const [showButtons, setShowButtons] = useState(false);

  const deletePopover = (
    <Popover id='delete-cornell-section'>
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
        }}
      >
        {!isViewing && <>
          <ButtonGroup style={{ float: 'right' }}>
            {moveUp && <Button
              style={{
                background: 'none',
                border: 'none',
                float: 'right'
              }}
              tabIndex={-1}
              onClick={moveUp}
            >
              <i className='fas fa-caret-up' style={{ padding: '0', color: '#001100' }} />
            </Button>}
            {moveDown && <Button
              style={{
                background: 'none',
                border: 'none',
                float: 'right',
              }}
              tabIndex={-1}
              onClick={moveDown}
            >
              <i className='fas fa-caret-down' style={{ padding: '0', color: '#001100' }} />
            </Button>}
            <OverlayTrigger trigger='click' placement='bottom' overlay={deletePopover} rootClose>
              <Button
                style={{
                  background: 'none',
                  border: 'none',
                  float: 'right'
                }}
                tabIndex={-1}
              >
                <i className='far fa-trash-alt fa-sm' style={{ padding: '0', color: '#dc3545' }} />
              </Button>
            </OverlayTrigger>
          </ButtonGroup>
          <br />
        </>}
        <FullEditor
          editor={cueEditor}
          readOnly={isViewing}
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
        }}
      >
        {showButtons && <EditorButtons
          editor={contentEditor}
          className='pl-2 pt-2 mb-0'
        />}
        {!isViewing && <>
          <Button
            className='float-right mt-2 mr-2'
            onClick={() => setShowButtons(!showButtons)}
            variant='light'
          >
            <i className='fas fa-bars fa-sm' />
          </Button>
          <br />
        </>}
        <FullEditor
          editor={contentEditor}
          readOnly={isViewing}
          styleOptions={styleOptions}
        />
      </Slate>
    </td>
  </>);
}
