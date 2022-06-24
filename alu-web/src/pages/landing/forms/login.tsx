import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import GoogleLoginComponent from './google-login-component';
import Modal from 'react-bootstrap/Modal';
import { apiProfileLogin } from '../../../lookup';
import { errorHandler } from '../../../utils';
import { useState } from 'react';

export function LoginForm(props) {
  const returnUrl = props.returnUrl ? new URL(props.returnUrl).pathname : null;
  const [isLoading, setIsLoading] = useState(false);

  const loginHandler = (event) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    const form = event.target;

    // Log the user in
    apiProfileLogin(
      form.elements.loginUsernameOrEmail.value,
      form.elements.loginPassword.value,
      (response, status) => {
        let errorMsg;

        if (status === 200) {
          window.location.href = returnUrl ? returnUrl : '/home/';
        } else if (response.message === 'Incorrect password') {
          errorMsg = 'Your password is incorrect.  Click <a href="/reset-password/">here</a> to reset it.';
        } else if (response.message === 'Unrecognized username') {
          errorMsg = 'Alu doesn\'t recognize your username.  Perhaps try using your email instead?';
        } else if (response.message === 'Unrecognized email') {
          errorMsg = 'Alu doesn\'t recognize your email.  You can create an account <a href="/?showLoginRequired=true">here</a>.';
        } else if (response.message === 'Account not active') {
          errorMsg = 'Your account has been deactivated due to suspicious activity.  Contact support at <a href="mailto:support@alulearn.com">support@alulearn.com</a> if you believe this was a mistake.';
        } else {
          // Error logging-in the user
          errorHandler(response, status, 3006);
        }
        setIsLoading(false);

        if (errorMsg)
          document.getElementById('loginAuthFail')!.innerHTML = errorMsg;
      },
    );
  }

  return (
    <Form onSubmit={loginHandler}>
      <div className='w-100 text-center'>
        <GoogleLoginComponent type='signin' />
      </div>
      <hr />
      <p id='loginAuthFail' className='text-danger mb-0'></p>
      <Form.Group>
        <Form.Label className='mb-0'>Username or Email</Form.Label>
        <Form.Control
          type='text'
          name='loginUsernameOrEmail'
          autoComplete='current-username'
          maxLength={75}
          style={{textTransform: 'lowercase'}}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className='mb-0'>Password</Form.Label>
        <Form.Control
          type='password'
          name='loginPassword'
          autoComplete='password'
          maxLength={512}
          required
        />
      </Form.Group>
      <div>
        <p>Forgot your password? Click <a href='/reset-password/'>here</a> to reset it</p>
      </div>
      <Modal.Footer>
        <Button type='submit' id='login-btn' block>
          {isLoading ? 'Logging you in...' : 'Log-in'}
        </Button>
      </Modal.Footer>
    </Form>
  );
}
