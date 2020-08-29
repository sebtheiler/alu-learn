import React, {useState} from 'react';
import {Modal, Form, Button} from 'react-bootstrap';
import {apiProfileLogin} from '../../lookup';

export function LoginForm(_props) {
  // const {} = props;

  const [isLoading, setIsLoading] = useState(false);

  const loginHandler = (event) => {
    event.preventDefault();
    if (isLoading) {
      return;
    };
    setIsLoading(true);
    const form = event.target;

    console.log(
      form.elements.loginUsername.value,
      form.elements.loginPassword.value,
    )
    apiProfileLogin(
      form.elements.loginUsername.value,
      form.elements.loginPassword.value,
      (response, status) => {
        if (status === 200) {
          window.location.reload();
        } else if (response.message === 'Invalid credentials') {
          document.getElementById('loginAuthFail').innerText =
            `We don't recognize your username and password.  Maybe try typing it again?`
        } else {
          console.log(response, status);
          alert('Error signing you in');
        };
        setIsLoading(false);
      },
    );
  };

  return (
    <Form onSubmit={loginHandler}>
      <p id='loginAuthFail' className='text-danger mb-0'></p>
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
      <div>
        <p>Forgot your password? Click <a href='/TODO:/'>TODO: here</a> to reset it</p>
      </div>
      <Modal.Footer>
        <Button type='submit' variant='primary' block>
          {isLoading ? 'Loading...' : 'Log-in'}
        </Button>
      </Modal.Footer>
    </Form>
  );
};