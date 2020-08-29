import React, {useState} from 'react';
import {Modal, Form, Button} from 'react-bootstrap';
// import {apiAuthenticateCredentials} from '../../lookup';

export function LoginForm(_props) {
  // const {} = props;

  const [isLoading, setIsLoading] = useState(false);

  const loginHandler = (event) => {
    event.preventDefault();

    const form = event.target;

    console.log(
      form.elements.loginUsername.value,
      form.elements.loginPassword.value,
    )
  };

  return (
    <Form onSubmit={loginHandler}>
      <p id='registerUsernameError' className='text-danger mb-0'></p>
      <Form.Group>
        <Form.Label className='mb-0'>Username</Form.Label>
        <Form.Control
          type='text'
          name='loginUsername'
          maxLength={15}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className='mb-0'>Password</Form.Label>
        <Form.Control
          type='password'
          name='loginPassword'
          maxLength={512}
          required
        />
      </Form.Group>
      <Form.Group>
        {/*
        The React-Bootstrap checkmark is very broken,
        so we are temporarily using regular HTML. Once
        it is fixed we can replace this with proper React-
        Bootstrap
        */}
        <label className="form-check-label">
          <input type="checkbox" required="required" />{' '}
          I continue to accept the <a href='/legal/tos/' target='_blank'>
          Terms of Service</a> and{' '}
          <a href='/legal/privacypolicy/' target='_blank'>
          Privacy Policy</a>.
        </label>
      </Form.Group>
      <Modal.Footer>
        <Button type='submit' variant='primary' block>
          {isLoading ? 'Loading...' : 'Log-in'}
        </Button>
      </Modal.Footer>
    </Form>
  );
};