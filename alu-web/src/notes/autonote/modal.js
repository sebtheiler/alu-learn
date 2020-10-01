import React from 'react';
import {Button, Modal} from 'react-bootstrap';
import {AutoNote} from './reader';
import './modal.css';

export function AutoNoteModal(props) {
  const {show, hide, updateNoteCallback} = props;

  return (
    <Modal show={show} onHide={hide} size='90w'>
      <Modal.Header>
        <Modal.Title>
          Creating Auto-notes from Document
        </Modal.Title>
      </Modal.Header>
      <AutoNote updateNoteCallback={updateNoteCallback} />
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