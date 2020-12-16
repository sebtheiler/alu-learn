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
        const videoUrl = form.elements.videoLink.value;
        const match = videoUrl.match(/watch\?v=.{11}/gm);
        if (!match) {
          document.getElementById('videoUrlError').innerHTML = 'We can\'t recognize this URL, please try reformatting it';
          return;
        }
        const videoId = match[0].slice(-11);
        setInputText(videoId);
        break;
      default:
        break;
    }
    setGaveInputText(true);
  }

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
          <Form.Group className='row mt-3'>
            <div className='col-6 text-center'>
              <h3><Form.Label
                as='a'
                onClick={() => setInputType('text')}
                style={{
                  textDecoration: inputType === 'text' ? 'underline' : '',
                  color: inputType === 'text' ? 'black' : 'grey',
                  cursor: 'pointer',
                }}
              >
                Text
              </Form.Label></h3>
            </div>
            <div className='col-6 text-center'>
              <h3><Form.Label
                as='a'
                onClick={() => setInputType('video')}
                style={{
                  textDecoration: inputType === 'video' ? 'underline' : '',
                  color: inputType === 'video' ? 'black' : 'grey',
                  cursor: 'pointer',
                }}
              >
                Video
              </Form.Label></h3>
            </div>
          </Form.Group>
          {inputType === 'text' && <>
            <Form.Group>
              <Form.Label>Text to Take Notes On</Form.Label>
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
              <p id='videoUrlError' className='text-danger' />
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
}
