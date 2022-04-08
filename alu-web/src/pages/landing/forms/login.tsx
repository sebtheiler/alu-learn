import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_PUBLIC_SITEKEY } from '.';
import { apiProfileLogin } from '../../../lookup';
import { errorHandler } from '../../../utils';
import { useRef, useState } from 'react';

export function LoginForm(props) {
  const returnUrl = props.returnUrl ? new URL(props.returnUrl).pathname : null;
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loginHandler = (event) => {
    event.preventDefault();
    if (isLoading || !recaptchaRef.current) return;
    setIsLoading(true);
    const form = event.target;

    // Test recaptcha
    recaptchaRef.current.execute();

    // Log the user in
    apiProfileLogin(
      form.elements.loginUsernameOrEmail.value,
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
        <ReCAPTCHA
          ref={recaptchaRef}
          size='invisible'
          sitekey={RECAPTCHA_PUBLIC_SITEKEY}
        />
      </Modal.Footer>
    </Form>
  );
}
