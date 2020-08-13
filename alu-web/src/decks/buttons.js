import React, {useState} from 'react';
import {apiDeckDelete, apiDeckEdit} from '../lookup';
import {Modal, Button, Form} from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";


// Button for editing the properties of a deck
// This may be renamed to option in the future
// This will eventually create a pop-up modal
export function EditButton(props) {
  const {deck} = props;
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const saveHandler = (event) => {
    event.preventDefault();
    let form = event.target;
    if (form.elements.title.value === deck.title && form.elements.description.value === deck.description /* && (form.elements.isPublic.value === 'on') === deck.isPublic */) {
      return;
    };

    apiDeckEdit(deck.id, form.elements.title.value, form.elements.description.value, form.elements.isPublic.value === 'on', (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else {
        console.log(response, status);
        alert('Error saving your deck');
      };
    });
  };

  const deleteHandler = () => {
    apiDeckDelete(deck.id, (response, status) => {
      if (status === 200) {
        window.location.reload();
      } else if (status === 403) {
        alert('You must log in!')
      } else {
        console.log(response, status);
        alert('Error deleting your deck!');
      }
    });
  };

  return (
    <div>
      <Button onClick={openModal} variant='primary' className='mr-1'>Edit</Button>
      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header>
          <Modal.Title>
            Edit "{deck.title}"
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={saveHandler}>
          <Modal.Body>
            <Form.Group>
              <Form.Control type='text' placeholder='Deck title' name='title' defaultValue={deck.title} />
            </Form.Group>
            <Form.Group>
              <Form.Control as='textarea' rows='3' placeholder='Description' name='description' defaultValue={deck.description} />
            </Form.Group>
            <Form.Group>
              <Form.Check type='checkbox' label='Make public?' name='isPublic' checked={deck.isPublic} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={deleteHandler} variant='danger' className='text-left mr-auto'>Delete Deck</Button>
            <Button onClick={closeModal} variant='secondary'>Cancel</Button>
            <Button type='submit' variant='primary'>Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};


// Simply a button wrapped in a link
export function RedirectButton(props) {
  const {link} = props;
  const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
  const target = props.target ? props.target : '_self'; // _blank = new tab, _self = same tab

  return (<a href={link.href} target={target} rel='noopener noreferrer'>
            <button className={className}>{link.display}</button>
          </a>);
};