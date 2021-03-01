import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiDeckTextImport } from '../lookup';
import { errorHandler } from '../utils';

export function DeckImportComponent() {
  const fileRef = React.createRef<HTMLInputElement>();
  const titleRef = React.createRef<HTMLInputElement>();

  const [uploadType, setUploadType] = useState('TXT');
  const [isLoading, setIsLoading] = useState(false)
  
  // Used for dynamically changing object positioning
  const calculateMarginClass = () => {
    if (document.documentElement.clientWidth > 850) {return 'w-50'} else
    if (document.documentElement.clientWidth < 850) {return 'w-75'} else
    if (document.documentElement.clientWidth < 500) {return 'w-100'}
  }

  const [widthClass, setWidthClass] = useState(calculateMarginClass());

  window.addEventListener("resize", (_event) => {
    setWidthClass(calculateMarginClass())
  });

  const handleImport = (event) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.target;
    const file = form.uploadFile.files[0];
    const convertFormatting = false; // form.elements.convertFormatting.checked;

    const apiImport = textData => apiDeckTextImport(form.elements.deckTitle.value, textData, convertFormatting, (response, status) => {
      if (status === 201) {
        window.location.href = `/decks/${response.id}/flashcards/`;
      } else {
        // Error importing deck from .txt file
        errorHandler(response, status, 1013);
      }
      setIsLoading(false);
    });

    if (file) {
      // If the user uploaded a file
      file.text().then((fileContents) => {
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
      {uploadType === 'TXT' && <>
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
        <small className='text-secondary'>
          Not required if you copy-pasted directly
        </small><br />
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

            // Update the label to the name of the uploaded file
            onChange={() => {
              const txtFileLabel = document.getElementById('txt-file-label');
              if (txtFileLabel && fileRef) {
                txtFileLabel.innerHTML =
                  fileRef!.current!.value.replace('C:\\fakepath\\', '');
              }
            }}
          />
        </Form.Group>
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
            className={`mx-auto ${widthClass}`}
          />
        </Form.Group>
        {/* <Form.Group>
          <FormCheckbox name='convertFormatting' id='convertFormatting'>
            Convert Anki formatting to Alu formatting?{' '}
            <QuestionBubble>
              For example: \[$$\] ➡ $$, \[$\] ➡ $, $ ➡ \$
            </QuestionBubble>
          </FormCheckbox>
        </Form.Group> */}
        <Form.Group>
          <Button
            type='submit'
            className={`${widthClass} mx-auto`}
            block
          >{isLoading ? 'Loading...' : 'Import!'}</Button>
        </Form.Group>
      </>}
      {uploadType === 'QUIZLET' && <div className='container-fluid'>
        <p className='text-left'>
          We are working hard to make Quizlet imports as easy as possible.<br />
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
          We currently don't support Anki imports, but are working hard to implement them as soon as possible.<br />
          In the meanwhile, you can export your deck as a .txt file and import it to Alu through the .txt upload.
        </p>
      </>}
    </Form>
  );
}