import React from 'react';
import { Deck } from '../../types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import './modals.css';


interface EditModalProps {
  deck: Deck;
  modalIsOpen: boolean;
  closeModal(): void;
}
export default function EditModal(props: EditModalProps) {
  const { deck, modalIsOpen, closeModal } = props;

  const editDeck = event => {
    event.preventDefault();
  }

  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>Editing "{deck.title}"</Modal.Title>
      </Modal.Header>
      <Form onSubmit={editDeck}>
        <Modal.Body>
          {/* <Form.Group>
            <Form.Label>Type of Game</Form.Label>
            <Form.Control
              as='select'
              name='gameType'
              custom
            >
              <option value='MATCHING'>Matching</option>
              <option value='QUIZ'>Quiz</option>
              <option value='CRAM'>Cram</option>
            </Form.Control>
          </Form.Group> */}
          {/* <div className="g-input">
            <input type="text" placeholder=" " />
            <label>Username</label>
          </div>
          <div className="g-input">
            <input type="password" placeholder=" " />
            <label>Password</label>
          </div>

          <div className="g-input fill">
            <input type="text" placeholder=" " />
            <label>Username</label>
          </div>
          <div className="g-input fill">
            <input type="password" placeholder=" " />
            <label>Password</label>
          </div>

          <div className="g-input fill">
            <textarea placeholder=" " />
            <label>Text area</label>
          </div> */}
        </Modal.Body>
        <Modal.Footer>
          <Button type='submit' block>Play!</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
