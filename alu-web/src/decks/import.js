import React, {useState} from 'react';
import { Form, Button } from 'react-bootstrap';
import {apiDeckTextImport} from '../lookup';
import {errorHandler} from '../utils';

export function DeckImportComponent() {
  const fileRef = React.createRef();
  const titleRef = React.createRef();

  const [uploadType, setUploadType] = useState('TXT');

  const handleImport = (event) => {
    event.preventDefault();
    const file = event.target.uploadFile.files[0];

    file.text().then((response) => {
      const fileContents = response;

      apiDeckTextImport(titleRef.current.value, fileContents, (response, status) => {
        if (status === 201) {
          window.location.href = '/home/decks/';
        } else {
          // Error importing deck from .txt file
          errorHandler(response, status, 1013);
        };
      });
    });
  };

  return (
    <Form onSubmit={handleImport} className='w-50 mx-auto mt-5 text-center'>
      <Form.Group>
        {/* For some reason, switching this to a <label> freaks it out */}
        <p className='mb-0'>Type of Import</p>
        <Form.Control
          as='select'
          className='w-50'
          defaultValue={uploadType}
          onChange={(event) => setUploadType(event.target.value)}
          custom
        >
          <option value='TXT'>Upload from *.txt</option>
          <option value='APKG'>Upload from *.apkg</option>
          <option value='QUIZLET'>Upload from Quizlet</option>
        </Form.Control>
      </Form.Group>
      {uploadType === 'TXT' ? <>
        <Form.Group>
          <Form.Label className='w-50' style={{lineHeight: '15px'}}>
            <p className='mb-1'>Title of deck</p>
            <small className='text-secondary w-50 mb-0'>
              If you enter the name of a deck that already exists, the uploaded contents will be appended to that deck.
            </small>
          </Form.Label>
          <Form.Control
            ref={titleRef}
            type='text'
            placeholder='My deck'
            className='w-50 mx-auto text-center'
            required
          />
        </Form.Group>
        <p className='mb-0'>
          Select the file to import
        </p>
        <Form.Group className='custom-file mb-4 w-50'>
          <Form.Label
            className='custom-file-label'
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
          <Button
            type='submit'
            className='w-50 mx-auto'
            block
          >Import!</Button>
        </Form.Group>
      </> : 
      <p>We currently don't support imports of this type. We are working hard to implement this functionality as soon as possible.</p>
      }
    </Form>
  );
};