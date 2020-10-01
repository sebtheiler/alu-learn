import React, {useState} from 'react';
import {Button, Form, Modal} from 'react-bootstrap';
import {AutoNote} from './reader';
import './modal.css';

export function AutoNoteModal(props) {
  const {show, hide, updateNoteCallback, initialValue} = props;
  const [gaveInputText, setGaveInputText] = useState(false);
  const [inputText, setInputText] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    console.log(form.elements.textInput.value);
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
        />
      :
        <Form onSubmit={handleSubmit} className='w-75 mx-auto'>
          <Form.Group>
            <Form.Label as='h3'>Input Text</Form.Label>
            <Form.Control as='textarea' name='textInput' rows='10' />
          </Form.Group>
          <Button type='submit'>Take Notes on This Text</Button>
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