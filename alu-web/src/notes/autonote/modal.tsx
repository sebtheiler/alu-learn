import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { FormCheckbox } from '../../utils';
import { AutoNote } from './autonote';
import './modal.css';

interface AutoNoteSettings {
  inputType: 'text' | 'video';
  removeLinebreak: boolean;
  textSplittingVer: 'SENTENCE' | 'PARAGRAPH';
  numSentences: number;
}
export function AutoNoteModal({ show, hide, updateNoteCallback, initialValue }) {
  const [gaveInputText, setGaveInputText] = useState(false);
  const [inputText, setInputText] = useState('');
  const [settings, setSettings] = useState<AutoNoteSettings>({
    inputType: 'text', removeLinebreak: false, textSplittingVer: 'SENTENCE',
    numSentences: 3,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    switch (settings.inputType) {
      case 'text':
        setInputText(form.elements.textInput.value);
        break;
      case 'video':
        const videoUrl = form.elements.videoLink.value;
        const match = videoUrl.match(/watch\?v=.{11}/gm);
        if (!match) {
          document.getElementById('videoUrlError')!.innerHTML = 'We can\'t recognize this URL, please try reformatting it';
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
    <Modal show={show} onHide={hide} size='xl'>
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
          settings={settings}
        />
      :
        <Form onSubmit={handleSubmit} className='w-75 mx-auto'>
          <Form.Group className='row mt-3'>
            <div className='col-6 text-center'>
              <h3><Form.Label
                as='a'
                onClick={() => setSettings({...settings, inputType: 'text'})}
                style={{
                  textDecoration: settings.inputType === 'text' ? 'underline' : '',
                  color: settings.inputType === 'text' ? 'black' : 'grey',
                  cursor: 'pointer',
                }}
              >
                Text
              </Form.Label></h3>
            </div>
            <div className='col-6 text-center'>
              <h3><Form.Label
                as='a'
                onClick={() => setSettings({...settings, inputType: 'video'})}
                style={{
                  textDecoration: settings.inputType === 'video' ? 'underline' : '',
                  color: settings.inputType === 'video' ? 'black' : 'grey',
                  cursor: 'pointer',
                }}
              >
                Video
              </Form.Label></h3>
            </div>
          </Form.Group>
          {settings.inputType === 'text' && <>
            <Form.Group>
              <Form.Label>Text to Take Notes On</Form.Label>
              <Form.Control as='textarea' name='textInput' rows={10} required />
            </Form.Group>
            <Form.Group>
              <FormCheckbox onChange={event => setSettings({...settings, removeLinebreak: event.target.checked})}>
                Remove linebreaks? (Recommended for PDFs)
              </FormCheckbox><br />
            </Form.Group>
            <Form.Group>
              <Form.Label>Splitting Method (paragraph/sentence)</Form.Label>
              <Form.Control
                as='select'
                onChange={event => setSettings({
                  ...settings,
                  textSplittingVer: event.target.value as 'SENTENCE' | 'PARAGRAPH'
                })}
                custom
              >
                <option value='SENTENCE'>Split by the Sentence</option>
                <option value='PARAGRAPH'>Split by the Paragraph</option>
              </Form.Control>
            </Form.Group>
            {settings.textSplittingVer === 'SENTENCE' && <Form.Group>
              <Form.Label>Number of Sentences to Split</Form.Label>
              <Form.Control
                type='number'
                onChange={event => setSettings({...settings, numSentences: parseInt(event.target.value)})}
                defaultValue={settings.numSentences}
                min={1}
                max={15}
                required
              />
            </Form.Group>}
          </>}
          {settings.inputType === 'video' && <>
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
