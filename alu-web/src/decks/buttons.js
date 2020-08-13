import React, {useState} from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";


// Button for editing the properties of a deck
// This may be renamed to option in the future
// This will eventually create a pop-up modal
export function EditButton(props) {
  // const className = props.className ? props.className : 'btn btn-primary mb-4 mr-1';
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const saveHandler = () => {
    // Save
    closeModal();
  };

  return (
    <div>
      <Button onClick={openModal} variant='primary' className='mr-1'>Edit</Button>
      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header>
          <Modal.Title>
            Edit Deck
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Body text
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal} variant='danger'>Cancel</Button>
          <Button onClick={saveHandler} variant='primary'>Save</Button>
        </Modal.Footer>
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