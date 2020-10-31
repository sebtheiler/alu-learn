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
  const [inputType, setInputType] = useState('text');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    switch (inputType) {
      case 'text':
        setInputText(form.elements.textInput.value);
        break;
      case 'video':
        setInputText(form.elements.videoLink.value);
        break;
      default:
        break;
    }; 
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
          inputType={inputType}
          removeLinebreak={removeLinebreak}
        />
      :
        <Form onSubmit={handleSubmit} className='w-75 mx-auto'>
          <Form.Group className='row'>
            <Form.Label
              as='h3'
              onClick={() => setInputType('text')}
              className={'mt-3 text-center col-6 cursor-pointer' + (inputType === 'text' ? ' underline' : ' text-muted')}
            >
              Text
            </Form.Label>
            <Form.Label
              as='h3'
              onClick={() => setInputType('video')}
              className={'mt-3 text-center col-6 cursor-pointer' + (inputType === 'video' ? ' underline' : ' text-muted')}
            >
              Video
            </Form.Label>
          </Form.Group>
          {inputType === 'text' && <>
            <Form.Group>
              <Form.Control as='textarea' name='textInput' rows='10' />
            </Form.Group>
            <Form.Group>
              <FormCheckbox onChange={() => setRemoveLinebreak(!removeLinebreak)}>
                Remove linebreaks? (Recommended for PDFs)
              </FormCheckbox><br />
            </Form.Group>
          </>}
          {inputType === 'video' && <>
            <Form.Group>
              <Form.Label>Video to Take Notes On</Form.Label>
              <Form.Control
                type='text'
                name='videoLink'
                placeholder='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                required
              />
            </Form.Group>
          </>}
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