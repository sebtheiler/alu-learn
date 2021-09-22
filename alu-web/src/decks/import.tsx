import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiDeckJSONImport, apiDeckTextImport } from '../lookup';
import { errorHandler } from '../utils';
import { FancyFormFileUpload } from '../utils/utils';
import { Deck } from './types';

export function DeckImportComponent() {
  const titleRef = React.createRef<HTMLInputElement>();

  const [uploadType, setUploadType] = useState('TXT');
  const [isLoading, setIsLoading] = useState(false)

  const handleImport = (event) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.target;
    const file = form.uploadFile.files[0];

    const apiImport = (textData: string) => {
      const callback = (response: Deck, status: number) => {
        if (status === 201) {
          window.location.href = `/decks/${response.id}/flashcards/`;
        } else {
          // Error importing deck
          errorHandler(response, status, 1013);
        }
        setIsLoading(false);
      }

      switch (uploadType) {
        case 'TXT':
          apiDeckTextImport(form.elements.deckTitle.value, textData, false, callback);
          break;
        case 'JSON':
          apiDeckJSONImport(JSON.parse(textData), callback);
          break;
        default:
          return;
      }
    }

    if (file) {
      // If the user uploaded a file
      file.text().then((fileContents: string) => {
        apiImport(fileContents);
      });
    } else {
      // If the user copy-pasted directly
      apiImport(form.elements.txtCopyPaste.value);
    }
  }

  return (
    <Form onSubmit={handleImport} className={`mx-auto mt-5 text-center container`}>
      <Form.Group>
        <p className='mb-0'>Type of Import</p>
        <Form.Control
          as='select'
          defaultValue={uploadType}
          onChange={(event) => setUploadType(event.target.value)}
          custom
        >
          <option value='TXT'>Upload from *.txt (Text file)</option>
          <option value='JSON'>Upload from *.json (JSON file)</option>
          <option value='APKG'>Upload from *.apkg (Anki)</option>
          <option value='QUIZLET'>Upload from Quizlet</option>
        </Form.Control>
      </Form.Group>
      {uploadType === 'TXT' && <>
        <Form.Group>
          <Form.Label style={{ lineHeight: '15px' }}>
            <p className='mb-1'>Title of deck</p>
            <small className='text-secondary w-50 mb-0'>
              If you enter the name of a deck that already exists, the uploaded contents will be appended to that deck.
            </small>
          </Form.Label>
          <Form.Control
            ref={titleRef}
            type='text'
            placeholder='My deck'
            className='mx-auto'
            id='deckTitle' name='deckTitle'
            required
          />
        </Form.Group>
        <p className='mb-0'>
          Select the file to import
        </p>
        <small className='text-secondary'>
          Not required if you copy-pasted directly
        </small><br />
        <FancyFormFileUpload accept='.txt' />
        <Form.Group>
          <p className='mb-0'>
            Or Copy-Paste the Text Directly
          </p>
          <small className='text-secondary'>
            Useful for Quizlet imports. Not required if you uploaded a file
          </small>
          <Form.Control
            as='textarea'
            rows={10}
            name='txtCopyPaste'
            className='mx-auto'
          />
        </Form.Group>
        <Form.Group>
          <Button
            type='submit'
            className='mx-auto'
            block
          >
            {isLoading ? 'Importing...' : 'Import!'}
          </Button>
        </Form.Group>
      </>}
      {uploadType === 'JSON' && <div className='container-fluid'>
        <p className='mb-0'>
          Select the file to import
        </p>
        <FancyFormFileUpload accept='.json' />
        <Form.Group>
          <Button
            type='submit'
            className='mx-auto'
            block
          >
            {isLoading ? 'Importing...' : 'Import!'}
          </Button>
        </Form.Group>
      </div>}
      {uploadType === 'QUIZLET' && <div className='container-fluid'>
        <p className='text-left'>
          I'm working hard to make Quizlet imports as easy as possible.<br />
          In the meanwhile, please use these steps:
        </p>
        <ol className='text-left'>
          <li>Go to the Quizlet set you would like to import</li>
          <li>Click the three dots button, to see the more options dropdown</li>
          <li>Click "Export"</li>
          <li>Without changing any settings, click the "Copy text" button</li>
          <li>Change the Alu import type to .txt</li>
          <li>Give your new deck a title</li>
          <li>Paste the study set into the "Or Copy-Paste the Text Directly" section</li>
          <li>Click "Import!"</li>
        </ol>
      </div>}
      {uploadType === 'APKG' && <>
        <p>
          Alu currently doesn't support Anki imports, but I'm working hard to implement them as soon as possible.<br />
          In the meanwhile, you can export your deck as a .txt file and import it to Alu through the .txt upload.
        </p>
      </>}
    </Form>
  );
}