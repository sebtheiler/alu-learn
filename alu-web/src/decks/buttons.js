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

    // If nothing has changed, prevent the user from saving
    if (
        form.elements.title.value === deck.title &&
        form.elements.description.value === deck.description &&
        form.elements.sharingSetting.value === deck.sharing_setting
    ) {
      return;
    };

    // Tell the API to update the deck
    apiDeckEdit(deck.id, form.elements.title.value, form.elements.description.value, form.elements.sharingSetting.value, (response, status) => {
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
              <Form.Label>Title</Form.Label>
              <Form.Control type='text' placeholder='My deck' name='title' defaultValue={deck.title} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' rows='3' placeholder="My deck's description" name='description' defaultValue={deck.description} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Sharing Setting</Form.Label>
              <Form.Control
                as='select'
                name='sharingSetting'
                defaultValue={deck.sharing_setting}
                custom
              >
                <option value='PRIVATE'>Private</option>
                <option value='FRIENDS'>Friends only</option>
                <option value='PUBLIC'>Public</option>
              </Form.Control>
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