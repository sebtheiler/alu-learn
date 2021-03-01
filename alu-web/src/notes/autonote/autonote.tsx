import React, { useState, useMemo } from 'react';
import { AutoReader } from './reader';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Slate, ReactEditor } from 'slate-react';
import { Element, Node, Transforms } from 'slate';
import { createFullEditor, EditorButtons, FullEditor } from '../editor-components';
import { insertElement } from './inserter';
import './reader.css';

export const emptyValue: any = [
  {
    "type": "paragraph",
    "children": [
      {
        "text": ""
      },
    ],
  },
];

export const parseText = (
  text: string | Node[], /**`string` for PARAGRAPH and SENTENCE and `Node[]` for json */
  version: 'PARAGRAPH' | 'SENTENCE' | 'json'='PARAGRAPH',
  numSentences=3
) => {
  let finalText: string[] = [];
  switch (version) {
    case 'PARAGRAPH':
      return (text as string).split('\n');
    case 'SENTENCE':
      const periodCleanFunction = str => {
        return str.replace('Ph.D.', 'PhD').replace('Ph.D', 'PhD')
        .replace('Mr.', 'Mr').replace('Ms.', 'Ms').replace('Mrs.', 'Mrs')
        .replace('U.S.A.', 'USA').replace('U.S.', 'US');
      }
      const splitByPar = periodCleanFunction(text).split('\n').filter((par: string) => par && par.length > 3);

      for (const par of splitByPar) {
        // If there is no period, we assume it is a header
        let toPush: string;
        if (!(par.includes('.') || par.includes('!') || par.includes('…') || par.length > 150)) {
          // If it doesn't contain punctuation and is reasonalby short, we make the assumption it's a header
          toPush = `<h4>${par}</h4>`;
          finalText.push(toPush);
        } else {
          const splitPar = par.match(/.*?((\.[^a-zA-Z`_]*)|(\?)|(!))/gm); // break it apart by punction (., !, ?, .[1])
          if (splitPar.length > numSentences) {
            // If it is a long paragraph, we will split it
            // into sentences determined by `numSentences`
            for (let i = 0; i < splitPar.length; i+=numSentences) {
              toPush = splitPar.slice(i, i+numSentences).join(' ');
              finalText.push(toPush.trim());
            }
          } else {
            toPush = par;
            finalText.push(toPush);
          }
        }
      }

      return finalText;
    case 'json':
      for (const obj of text) {
        const object = obj as Node;
        const objectChildren = object.children as Node[];
        switch (object.type) {
          case 'paragraph':
            let htmlString = '';
            for (const child of object.children as Node[]) {
              const childChildren = child.children as Node[];
              let childText = child.text || (childChildren && childChildren[0]?.text);
              if (!childText) {
                // If the child is empty, continue without adding
                break;
              }
              if (child.type === 'link') {
                childText = `<a href=${child.url} target='_blank' rel='noopener noreferrer'>${childText}</a>`;
              }
              if (child.bold) {
                childText = `<strong>${childText}</strong>`;
              }
              if (child.italic) {
                childText = `<em>${childText}</em>`;
              }
              if (child.underline) {
                childText = `<u>${childText}</u>`;
              }
              if (child.strikethrough) {
                childText = `<del>${childText}</del>`;
              }
              htmlString += childText;
            }
            finalText.push(htmlString);
            break;
          case 'heading-one':
            finalText.push(`<h1>${objectChildren[0].text}</h1>`);
            break;
          case 'heading-two':
            finalText.push(`<h2>${objectChildren[0].text}</h2>`);
            break;
          case 'heading-three':
            finalText.push(`<h3>${objectChildren[0].text}</h3>`);
            break;
          default:
            break;
        }
      }
      return finalText;
    default:
      return;
  }
}

export function AutoNote(props) {
  const {updateNoteCallback, initialValue, settings} = props;
  const text = parseText(
    (settings.removeLinebreak ? props.text.replaceAll('\n', ' ') : props.text).trim(),
    settings.textSplittingVer,
    settings.numSentences,
  );

  const [selectedPar, setSelectedPar] = useState(0);
  const [finished, setFinished] = useState(false);
  const [noteDocument, setNoteDocument] = useState(initialValue);
  const [showCompiledNotes, setShowCompiledNotes] = useState(false);

  const [value, setValue] = useState(emptyValue);
  const editor = useMemo(
    () => createFullEditor(),
    []
  );
  const noteEditor = useMemo(
    () => createFullEditor(),
    []
  );

  const [percentComplete, setPercentComplete] = useState(0);
  const updateProgressBar = (newSelectedPar) => {
    const progressBar = document.getElementById('contentProgressBar');
    if (progressBar && text) {
      const newPercentComplete = Math.ceil(newSelectedPar / (text.length - 1) * 100);
      setPercentComplete(newPercentComplete);
      progressBar.style.width = Math.max(newPercentComplete, 4) + '%';
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    // Add the new notes to the document
    try {
      if (value !== emptyValue) {
        if (form.elements.sectionTitle.value.split('>').length > 6) {
          // If there are 5 or more '>'s, we can't handle it
          document.getElementById('tooManySectionsError')!.innerHTML = 'You can have a maximum of six subsections';
          return;
        } else {
          document.getElementById('tooManySectionsError')!.innerHTML = '';
        }
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
      }
      // Move selected paragraph
      if (settings.inputType === 'text') {
        if (text && selectedPar < text.length - 1) {
          setSelectedPar(selectedPar + 1);
        } else {
          setFinished(true);
        }
      }

      // Update progress bar
      updateProgressBar(selectedPar + 1);
    } catch (e) {
      console.log(noteDocument);
      alert(`Something "${e}" went wrong inserting your new note.  Please save now.`);
    }
  }

  return (<>
    {text && <AutoReader
      text={text}
      selectedPar={selectedPar}
      setSelectedPar={setSelectedPar}
      finished={finished}
      updateProgressBar={updateProgressBar}
      showCompiledNotes={showCompiledNotes}
      setShowCompiledNotes={setShowCompiledNotes}
      inputType={settings.inputType}
    >
      <Form onSubmit={handleSubmit} className='mt-4'>
        <Form.Group className='w-75 mx-auto'>
          <Form.Label as='h3'>Section (subsection with "&gt;")</Form.Label>
          <Form.Control
            type='text'
            name='sectionTitle'
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
        {settings.inputType === 'text' && <div id='contentProgress' className='mt-1'>
          <div id='contentProgressBar'>{percentComplete}%</div>
        </div>}
      </Form>
    </AutoReader>}
    {(finished || showCompiledNotes) && <div className='container'>
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
    </div>}
  </>);
}