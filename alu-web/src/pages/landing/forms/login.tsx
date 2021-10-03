import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import { apiProfileLogin } from '../../../lookup';
import { errorHandler } from '../../../utils';
import { useState } from 'react';

export function LoginForm(props) {
  const returnUrl = props.returnUrl ? new URL(props.returnUrl).pathname : null;

  const [isLoading, setIsLoading] = useState(false);

  const loginHandler = (event) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const form = event.target;

    apiProfileLogin(
      form.elements.loginUsername.value,
      form.elements.loginPassword.value,
      (response, status) => {
        if (status === 200) {
          window.location.href = returnUrl ? returnUrl : '/home/';
        } else if (response.message === 'Invalid credentials') {
          document.getElementById('loginAuthFail')!.innerText =
            `Alu doesn't recognize your username and password.  Maybe try typing it again?`
        } else {
          // Error logging-in the user
          errorHandler(response, status, 3006);
        }
        setIsLoading(false);
      },
    );
  }

  return (
    <Form onSubmit={loginHandler}>
      <p id='loginAuthFail' className='text-danger mb-0'></p>
      <Form.Group>
        <Form.Label className='mb-0'>Username</Form.Label>
        <Form.Control
          type='text'
          name='loginUsername'
          maxLength={15}
          style={{textTransform: 'lowercase'}}
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
      <div>
        <p>Forgot your password? Click <a href='/reset-password/'>here</a> to reset it</p>
      </div>
      <Modal.Footer>
        <Button type='submit' id='login-btn' block>
          {isLoading ? 'Loading...' : 'Log-in'}
        </Button>
      </Modal.Footer>
    </Form>
  );
}
