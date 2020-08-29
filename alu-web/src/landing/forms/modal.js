import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {RegisterForm} from './components';

export function RegisterLoginModal(props) {
  const {defaultEmail, modalIsOpen, closeModal} = props;

  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <h3 className='text-center'>Register</h3>
      </Modal.Header>
      <Modal.Body>
        <p className='text-center'>
          Create your account to start using Alu
        </p>
        <RegisterForm
          defaultEmail={defaultEmail}
        />
      </Modal.Body>
    </Modal>
  );
};