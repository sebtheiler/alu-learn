import React, { useState, useMemo } from 'react';
import {Button, ButtonGroup, Form} from 'react-bootstrap';
import {Slate, ReactEditor} from 'slate-react';
import {Transforms} from 'slate';
import {createFullEditor, EditorButtons, FullEditor} from '../editor-components';
import {insertElement} from './inserter';
import './reader.css';

const emptyValue = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": ""
      },
    ],
  },
];

const parseText = (text, version='paragraph') => {
  switch (version) {
    case 'paragraph':
      return text.split('\n');
    case 'sentence':
      const periodCleanFunction = (str) => {
        return str.replace('Ph.D.', 'PhD').replace('Ph.D', 'PhD')
        .replace('Mr.', 'Mr').replace('Ms.', 'Ms').replace('Mrs.', 'Mrs')
        .replace('U.S.A.', 'USA').replace('U.S.', 'US');
      };
      const splitByPar = periodCleanFunction(text).split('\n').filter(par => par && par.length > 3);
      const numSentences = 3;
      let finalText = [];

      for (const par of splitByPar) {
        // If there is no period, we assume it is a header
        let toPush;
        if (par.includes('.') === false) {
          toPush = `<h4>${par}</h4>`;
          finalText.push(toPush);
        } else {
          const splitPar = par.split(/\.[^a-zA-Z`_]*?\s/gm); // breaks on '. ' and '.[xx] '
          if (splitPar.length > numSentences) {
            // If it is a long paragraph, we will split it
            // into sentences determined by `numSentences`
            const numConcatSentences = Math.ceil(splitPar.length / numSentences);
            for (let i = 0; i < numConcatSentences; i++) {
              toPush = splitPar.slice(i*numConcatSentences, (i+1)*numConcatSentences).join('. ');
              finalText.push(toPush + (toPush.endsWith('.') ? '' : '.'));
            };
          } else {
            toPush = par;
            finalText.push(toPush);
          };
        };
      };

      return finalText;
    default:
      return;
  };
};

export function AutoNote(props) {
  const {updateNoteCallback, initialValue} = props;
  const text = parseText(props.text.trim(), 'sentence');

  const [selectedPar, setSelectedPar] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noteDocument, setNoteDocument] = useState(initialValue);
  const [showCompiledNotes, setShowCompiledNotes] = useState(false);
  const [percentComplete, setPercentComplete] = useState(0);

  window.onbeforeunload = function() {
    return "Data will be lost if you leave the page, are you sure?";
  };

  const [value, setValue] = useState(emptyValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );
  const noteEditor = useMemo(
    () => createFullEditor(),
    []
  );

  const updateProgressBar = (newSelectedPar) => {
    const newPercentComplete = Math.ceil(newSelectedPar / (text.length - 1) * 100);
    setPercentComplete(newPercentComplete);
    document.getElementById('contentProgressBar').style.width = Math.max(newPercentComplete, 4) + '%';
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    console.log(selectedPar, noteDocument);
    // Add the new notes to the document
    try {
      if (value !== emptyValue) {
        if (form.elements.sectionTitle.value.split('>').length > 6) {
          // If there are 5 or more '>'s, we can't handle it
          document.getElementById('tooManySectionsError').innerHTML = 'You can have a maximum of six subsections';
          return;
        } else {
          document.getElementById('tooManySectionsError').innerHTML = '';
        };
        const newDocument = insertElement(
          value,
          noteDocument,
          form.elements.sectionTitle.value,
        );
        setNoteDocument(newDocument);
        updateNoteCallback(newDocument);

        // Move the cursor to the beginning to avoid crash
        Transforms.move(editor, { edge: 'anchor', distance: 9999999, reverse: true });
        Transforms.move(editor, { edge: 'focus', distance: 9999999, reverse: true });
        ReactEditor.focus(editor);
    
        // Clear editor
        setValue(emptyValue);
      };
      // Move selected paragraph
      if (selectedPar < text.length - 1) {
        setSelectedPar(selectedPar + 1);
      } else {
        setFinished(true);
      };

      // Update progress bar
      updateProgressBar(selectedPar + 1);
    } catch (e) {
      console.log(noteDocument);
      alert(`Something "${e}" went wrong inserting your new note.  Please save now.`);
    };
  };

  return (<div className='container mt-5'>
    <h3 className='text-center'>Content</h3>
    <div style={{ border: '1px solid gray', padding: '30px', height: '250px', overflow: 'hidden', borderRadius: '5px' }}>
      {selectedPar !== 0 &&
        <p style={{ color: '#e0e0e0' }} dangerouslySetInnerHTML={{__html:
          `...${text[selectedPar - 1] && text[selectedPar - 1].substr(text[selectedPar - 1].length - 150, text[selectedPar - 1].length)}`
        }} />
      }
      <p style={{ color: '#000000' }} dangerouslySetInnerHTML={{__html: text[selectedPar]}} />
      {selectedPar !== text.length - 1 &&
        <p style={{ color: '#e0e0e0' }} dangerouslySetInnerHTML={{__html:
          `${text[selectedPar + 1] && text[selectedPar + 1].substr(0, 150)}...`
        }} />
      }
    </div>
    <ButtonGroup className='mt-1 float-right'>
      <Button
        variant='secondary'
        disabled={selectedPar === 0}
        onClick={event => {event.preventDefault(); setSelectedPar(selectedPar - 1); updateProgressBar(selectedPar - 1)}}
      >Go Back</Button>
      <Button
        variant='secondary'
        disabled={selectedPar === text.length - 1}
        onClick={event => {event.preventDefault(); setSelectedPar(selectedPar + 1); updateProgressBar(selectedPar + 1)}}
      >Go Forwards</Button>
      <Button
        variant='secondary'
        onClick={event => {event.preventDefault(); setShowCompiledNotes(!showCompiledNotes);}}
        className='ml-1'
      >{showCompiledNotes ? 'Hide' : 'Show'} Compiled Notes</Button>
    </ButtonGroup>
    {!finished && <>
      <Form onSubmit={handleSubmit} className='mt-4'>
        <Form.Group className='w-75 mx-auto'>
          <Form.Label as='h3'>Section (subsection with "&gt;")</Form.Label>
          <Form.Control
            type='text'
            name='sectionTitle'
            placeholder='B.F. Skinner > Skinner Box'
            required
          />
          <p id='tooManySectionsError' className='text-danger' />
        </Form.Group>
        <Form.Group>
          <Form.Label as='h3'>Notes</Form.Label>
          <div style={{ borderStyle: 'solid', borderWidth: '1px', paddingTop: '5px', paddingLeft: '5px' }}>
            <Slate
              editor={editor}
              value={value}
              onChange={newValue => {
                setValue(newValue);
              }}
            >
              <EditorButtons
                editor={editor}
              />
              <FullEditor
                editor={editor}
                styleOptions={{ minHeight: '200px' }}
              />
            </Slate>
          </div>
        </Form.Group>
        <Button type='submit' block>Add Notes</Button>
        <div id='contentProgress' className='mt-1'>
          <div id='contentProgressBar'>{percentComplete}%</div>
        </div>
      </Form>
    </>}
    {(finished || showCompiledNotes) && 
      <div className='my-5'>
        <h3 className='text-center'>Here are the notes you{finished ? ' took' : '\'ve taken'} for this paper:</h3>
        <Slate
          editor={noteEditor}
          value={noteDocument}
          onChange={newValue => setNoteDocument(newValue)}
        >
          <FullEditor
            editor={noteEditor}
            readOnly={true}
          />
        </Slate>
      </div>
    }
  </div>);
};