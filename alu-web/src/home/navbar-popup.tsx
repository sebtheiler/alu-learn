import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { apiProfileReadPopup } from '../lookup';
import { errorHandler } from '../utils';

export function NavbarPopup({ showUpdateModal, firstName }) {
  const [isOpen, setIsOpen] = useState(showUpdateModal);
  const closeModal = () => {
    apiProfileReadPopup((response,  status) => {
      if (status === 200) {
        // pass
      } else {
        // Error marking the profile popup as read
        errorHandler(response, status, 3022);
      }
    });
    setIsOpen(false);
  }

  if (!showUpdateModal) return null;
  return (
    <Modal show={isOpen} onHide={closeModal} size='xl'>
      <Modal.Header>
        <Modal.Title>{firstName ? `Welcome Back, ${firstName}!` : 'New Changes'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h1>Feedback Form</h1>
        <p>I've created a feedback form to get more insight into how people are using Alu, and what sort of features I should focus on.</p>
        <p>I would really appreciate it if you could take ~5 minutes to fill it out.  If you don't have the time right now, the link will be available at the top of your homepage until the end of March.</p>
        <p className='text-center'><a href='https://docs.google.com/forms/d/e/1FAIpQLSfkE2pgfn_tOaU6a-b27z-WTdA-31SZQKcJDqp7pMBzxpDqFg/viewform?usp=sf_link' target='_blank' rel='noreferrer'>
          Link to the form
        </a></p>
        <p>Best,<br />Sebastian</p>
        <p>(if you've already filled out the form, thank you, and you can ignore this)</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeModal} block>Got it!</Button>
      </Modal.Footer>
    </Modal>
  );
}