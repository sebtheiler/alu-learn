import React, {useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import {apiDeckTextImport} from '../lookup';
import {errorHandler, FormCheckbox, QuestionBubble} from '../utils';

export function DeckImportComponent() {
  const fileRef = React.createRef();
  const titleRef = React.createRef();

  const [uploadType, setUploadType] = useState('TXT');
  const [isLoading, setIsLoading] = useState(false)
  
  // Used for dynamically changing object positioning
  const calculateMarginClass = () => {
    if (document.documentElement.clientWidth > 850) {return 'w-50'} else
    if (document.documentElement.clientWidth < 850) {return 'w-75'} else
    if (document.documentElement.clientWidth < 500) {return 'w-100'}
  };

  const [widthClass, setWidthClass] = useState(calculateMarginClass());

  window.addEventListener("resize", (_event) => {
    setWidthClass(calculateMarginClass())
  });

  const handleImport = (event) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.target;
    const file = event.target.uploadFile.files[0];

    file.text().then((fileContents) => {
      apiDeckTextImport(form.elements.deckTitle.value, fileContents, form.elements.convertFormatting.checked, (response, status) => {
        if (status === 201) {
          window.location.href = `/decks/${response.id}/flashcards/`;
        } else {
          // Error importing deck from .txt file
          errorHandler(response, status, 1013);
        };
        setIsLoading(false);
      });
    });
  };

  return (
    <Form onSubmit={handleImport} className={`mx-auto mt-5 text-center ${widthClass}`}>
      <Form.Group>
        {/* For some reason, switching this to a <label> freaks it out */}
        <p className='mb-0'>Type of Import</p>
        <Form.Control
          as='select'
          className={widthClass}
          defaultValue={uploadType}
          onChange={(event) => setUploadType(event.target.value)}
          custom
        >
          <option value='TXT'>Upload from *.txt (Text file)</option>
          <option value='APKG'>Upload from *.apkg (Anki)</option>
          <option value='QUIZLET'>Upload from Quizlet</option>
        </Form.Control>
      </Form.Group>
      {uploadType === 'TXT' ? <>
        <Form.Group>
          <Form.Label className={widthClass} style={{lineHeight: '15px'}}>
            <p className='mb-1'>Title of deck</p>
            <small className='text-secondary w-50 mb-0'>
              If you enter the name of a deck that already exists, the uploaded contents will be appended to that deck.
            </small>
          </Form.Label>
          <Form.Control
            ref={titleRef}
            type='text'
            placeholder='My deck'
            className={`${widthClass} mx-auto`}
            id='deckTitle' name='deckTitle'
            required
          />
        </Form.Group>
        <p className='mb-0'>
          Select the file to import
        </p>
        <Form.Group className={`custom-file mb-4 ${widthClass}`}>
          <Form.Label
            className='custom-file-label text-left'
            htmlFor='txtFileUpload'
            id='txt-file-label'
          >
            Choose file
          </Form.Label>
          <Form.File
            className='custom-file-input'
            id='txtFileUpload'
            name='uploadFile'
            accept='.txt'
            ref={fileRef}
            required

            // Update the label to the name of the uploaded file
            onChange={() => document.getElementById('txt-file-label').innerHTML = fileRef.current.value.replace('C:\\fakepath\\', '')}
          />
        </Form.Group>
        <Form.Group>
          <FormCheckbox name='convertFormatting' id='convertFormatting'>
            Convert Anki formatting to Alu formatting?{' '}
            <QuestionBubble>
              For example: [$$] ➡ $$, [$] ➡ $, $ ➡ \$
            </QuestionBubble>
          </FormCheckbox>
        </Form.Group>
        <Form.Group>
          <Button
            type='submit'
            className={`${widthClass} mx-auto`}
            block
          >{isLoading ? 'Loading...' : 'Import!'}</Button>
        </Form.Group>
      </> : 
      <p>We currently don't support imports of this type. We are working hard to implement this functionality as soon as possible.</p>
      }
    </Form>
  );
};