import React from 'react';
import { Form, Button } from 'react-bootstrap';
import {apiDeckTextImport} from '../lookup';
import {errorHandler} from '../utils';

export function DeckImportComponent() {
  const fileRef = React.createRef();
  const titleRef = React.createRef();

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
    <Form onSubmit={handleImport}>
      <Form.Group>
        <Form.Label>
          Title of deck<br />
          <small className='text-secondary'>
            If you enter the name of a deck that already exists, the uploaded contents will be appended to that deck.
          </small>
        </Form.Label>
        <Form.Control
          ref={titleRef}
          type='text'
          placeholder='My deck'
          className='w-25'
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.File
          id='uploadFile'
          name='uploadFile'
          label='File to import'
          onChange={event => console.log(event)}
          ref={fileRef}
          required
        />
      </Form.Group>
      <Form.Group>
        <Button type='submit'>Import!</Button>
      </Form.Group>
    </Form>
  );
};