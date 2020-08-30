import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {RegisterForm} from './register';
import {LoginForm} from './login';

export function RegisterLoginModal(props) {
  const {defaultEmail, defaultForm, modalIsOpen, closeModal, returnUrl} = props;

  const [formToDisplay, setFormToDisplay] = useState(defaultForm ? defaultForm : 'REGISTER');

  return (
    <Modal show={modalIsOpen} onHide={closeModal}>
      <Modal.Header>
        <div className='row w-100'>
          <div className='col-6'>
            <h3
              className={
                'text-center' + (formToDisplay
                  !== 'REGISTER' ? ' text-secondary'
                  : '')
                }
              style={{
                textDecoration: (formToDisplay === 'REGISTER' ? 'underline' : 'none'),
                cursor: 'pointer',
              }}
              onClick={_event => setFormToDisplay('REGISTER')}
            >
              Register
            </h3>
          </div>
          <div className='col-6'>
            <h3
              className={
                'text-center' + (formToDisplay
                  !== 'LOGIN' ? ' text-secondary'
                  : '')
                }
              style={{
                textDecoration: (formToDisplay === 'LOGIN' ? 'underline' : 'none'),
                cursor: 'pointer',
              }}
              onClick={_event => setFormToDisplay('LOGIN')}
            >
              Log-in
            </h3>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className={formToDisplay !== 'REGISTER' ? 'd-none' : ''}>
          <p className='text-center'>
            Create your account to start using Alu
          </p>
          <RegisterForm
            defaultEmail={defaultEmail}
            returnUrl={returnUrl}
          />
        </div>
        <div className={formToDisplay !== 'LOGIN' ? 'd-none' : ''}>
          <p className='text-center'>
            Welcome back!
          </p>
          <LoginForm
            returnUrl={returnUrl}
          />
        </div>
      </Modal.Body>
    </Modal>
  );
};