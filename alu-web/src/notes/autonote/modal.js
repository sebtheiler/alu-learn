import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { FormCheckbox } from '../../utils';
import { AutoNote } from './autonote';
import './modal.css';

export function AutoNoteModal(props) {
  const {show, hide, updateNoteCallback, initialValue} = props;
  const [gaveInputText, setGaveInputText] = useState(false);
  const [inputText, setInputText] = useState('');
  const [removeLinebreak, setRemoveLinebreak] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    setInputText(form.elements.textInput.value);
    setGaveInputText(true);
  };

  return (
    <Modal show={show} onHide={hide} size='90w'>
      <Modal.Header>
        <Modal.Title>
          Creating Auto-notes from Document
        </Modal.Title>
      </Modal.Header>
      {gaveInputText ?
        <AutoNote
          updateNoteCallback={updateNoteCallback}
          initialValue={initialValue}
          text={inputText}
          removeLinebreak={removeLinebreak}
        />
      :
        <Form onSubmit={handleSubmit} className='w-75 mx-auto'>
          <Form.Group>
            <Form.Label as='h3' className='mt-3'>Input Text</Form.Label>
            <Form.Control as='textarea' name='textInput' rows='10' />
          </Form.Group>
          <FormCheckbox onChange={() => setRemoveLinebreak(!removeLinebreak)}>
            Remove linebreaks? (Recommended for PDFs)
          </FormCheckbox><br />
          <Button type='submit' className='mt-2'>Take Notes on This Text</Button>
        </Form>
      }
      <Modal.Footer className='mt-3'>
        <Button
          variant='secondary'
          onClick={hide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};