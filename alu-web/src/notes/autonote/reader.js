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

const initialValue = emptyValue // [
//   {
//     "type": "paragraph",
//     "children": [
//       {
//         "text": ""
//       }
//     ]
//   },
//   {
//     "type": "heading-one",
//     "children": [
//       {
//         "text": "Mary Whiton Calkins"
//       }
//     ]
//   },
//   {
//     "type": "paragraph",
//     "children": [
//       {
//         "text": "Female philosopher and psychologist, when women were heavily discriminated against"
//       }
//     ]
//   }
// ]

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

window.onbeforeunload = function() {
  return "Data will be lost if you leave the page, are you sure?";
};

const text = parseText(`
Ivan Pavlov was a Russian physiologist best known in psychology for his discovery of classical conditioning. During his studies on the digestive systems of dogs, Pavlov noted that the animals salivated naturally upon the presentation of food.

However, he also noted that the animals began to salivate whenever they saw the white lab coat of an experimental assistant. It was through this observation that Pavlov discovered that by associating the presentation of food with the lab assistant, a conditioned response occurred.
Overview

This discovery had a reverberating influence on psychology. Pavlov was also able to demonstrate that the animals could be conditioned to salivate to the sound of a tone as well. Pavlov's discovery had a major influence on other thinkers including John B. Watson and contributed significantly to the development of the school of thought known as behaviorism.

Take a closer look at Ivan Pavlov's life and career in this brief biography.

Ivan Pavlov is best known for:

    Classical conditioning
    Research on physiology and digestion
    1904 Nobel Prize in Physiology

His Early Life

Ivan Petrovich Pavlov was born on September 14, 1849, in the village of Ryazan, Russia, where his father was the village priest. His earliest studies were focused on theology, but reading Charles Darwin's On the Origin of the Species had a powerful influence on his future interests.

He soon abandoned his religious studies and devoted himself to the study of science. In 1870, he began studying the natural sciences at St. Petersburg University.
Pavlov's Career

Pavlov's primary interests were the study of physiology and natural sciences. He helped found the Department of Physiology at the Institute of Experimental Medicine and continued to oversee the program for the next 45 years.1﻿

"Science demands from a man all his life. If you had two lives that would not be enough for you. Be passionate in your work and in your searching," Pavlov once suggested.

So, how did his work in physiology lead to his discovery of classical conditioning?
Discovery of Classical Conditioning

While researching the digestive function of dogs, he noted his subjects would salivate before the delivery of food.2﻿ In a series of well-known experiments, he presented a variety of stimuli before the presentation of food, eventually finding that, after repeated association, a dog would salivate to the presence of a stimulus other than food.

Pavlov termed this response a conditional reflex. Pavlov also discovered that these reflexes originate in the cerebral cortex of the brain.3﻿

Pavlov received considerable acclaim for his work, including a 1901 appointment to the Russian Academy of Sciences and the 1904 Nobel Prize in Physiology.4﻿﻿ The Soviet government also offered substantial support for Pavlov's work, and the Soviet Union soon became a leading center of physiology research.

He died on February 27, 1936.
Contributions to Psychology

Many outside of psychology may be surprised to learn that Pavlov was not a psychologist at all. Not only was he not a psychologist; he reportedly was skeptical of the emerging field of psychology altogether.

However, his work had a major influence on the field, particularly on the development of behaviorism. His discovery and research on reflexes influenced the growing behaviorist movement, and his work was often cited in John B. Watson's writings.

Other researchers utilized Pavlov's work in the study of conditioning as a form of learning. His research also demonstrated techniques of studying reactions to the environment in an objective scientific method. 
`.trim(), 'sentence');

export function AutoNote(props) {
  const [selectedPar, setSelectedPar] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noteDocument, setNoteDocument] = useState(initialValue);
  const [showCompiledNotes, setShowCompiledNotes] = useState(false);
  const [percentComplete, setPercentComplete] = useState(0);

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
        const newDocument = insertElement(
          value,
          noteDocument,
          form.elements.sectionTitle.value,
        );
        setNoteDocument(newDocument);

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
    <div id='contentProgress' className='mb-1'>
      <div id='contentProgressBar'>{percentComplete}%</div>
    </div>
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