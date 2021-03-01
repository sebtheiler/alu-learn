import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { apiPasswordChange, apiPasswordReset, apiEmailChange } from '../../lookup';
import { errorHandler } from '../../utils';


interface ChangePasswordEmailProps {
  type: 'password' | 'email';
  isReset: 'true' | 'false';
}
export function ChangePasswordEmail(props: ChangePasswordEmailProps) {
  const type = props.type ? props.type : 'password';
  const isReset = props.isReset && props.isReset.toLowerCase() === 'true';

  const urlSearch = isReset ? new URLSearchParams(window.location.search) : undefined;
  const resetKey = urlSearch && urlSearch.get('k');
  const email = urlSearch && urlSearch.get('email');

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    if (isLoading === true) {
      return;
    }
    setIsLoading(true);

    if (isReset) {
      if (form.elements.newPassword.value !== form.elements.confirmPassword.value) {
        document.getElementById('passwordsDoNotMatch')!.innerHTML =
          `Passwords do not match`
        return;
      } else {
        document.getElementById('passwordsDoNotMatch')!.innerHTML = '';
      }

      apiPasswordReset(email, resetKey, form.elements.newPassword.value, (response, status) => {
        if (status === 200) {
          window.location.href = '/login/';
        } else if (response.message === 'Invalid reset key') {
          document.getElementById('invalidKey')!.innerHTML =
          `The reset link you followed doesn't appear to be working.
           Perhaps try resetting your password again.`
        } else {
          // Error resetting password
          errorHandler(response, status, 3018);
        }
      });
    } else {
      const setInvalidCreds = () => {
        document.getElementById('invalidCreds')!.innerHTML = `
          Your password appears to be incorrect. You can reset it
          <a href='/reset-password/'>here</a>.`
      }
      if (type === 'password') {
        if (form.elements.newPassword.value !== form.elements.confirmPassword.value) {
          document.getElementById('passwordsDoNotMatch')!.innerHTML =
            `Passwords do not match`
          return;
        } else {
          document.getElementById('passwordsDoNotMatch')!.innerHTML = '';
        }
        apiPasswordChange(form.elements.oldPassword.value, form.elements.newPassword.value, (response, status) => {
          if (status === 200) {
            window.location.href = '/login/';
          } else if (response.message === 'Invalid credentials') {
            setInvalidCreds();
            return;
          } else {
            // Error changing password
            errorHandler(response, status, 3017);
          }
        });
      } else if (type === 'email') {
        apiEmailChange(form.elements.oldPassword.value, form.elements.newEmail.value, (response, status) => {
          if (status === 200) {
            window.location.href = '/confirm-email/';
          } else if (response.message === 'Invalid credentials') {
            setInvalidCreds();
            return;
          } else {
            // Error changing email
            errorHandler(response, status, 3020);
          }
        });
      }
    }
  }

  const newPasswordConfirm = (<>
    <Row>
      <Col sm='6'>
        <Form.Label as='h4'>New Password</Form.Label>
        <Form.Control
          type='password'
          name='newPassword'
          className='mx-auto'
          maxLength={1024}
          required
        />
      </Col>
      <Col sm='6'>
        <Form.Label as='h4'>New Password (confirm)</Form.Label>
        <Form.Control
          type='password'
          name='confirmPassword'
          className='mx-auto'
          maxLength={1024}
          required
        />
      </Col>
    </Row>
    <small className='text-danger' id='passwordsDoNotMatch'></small>
  </>);

  if (resetKey && email) {
    return (<>
      <h1 className='my-5'>Reset password for "{email}"</h1>
      <small className='text-danger' id='invalidKey'></small>
      <Form onSubmit={event => {handleSubmit(event); setIsLoading(false);}}>
        {newPasswordConfirm}
        <Button type='submit' className='my-5' block>Reset</Button>
      </Form>
    </>);
  } else {
    return (<>
      <h1 className='text-center mt-5'>
        Update {type[0].toUpperCase() + type.substring(1)}
      </h1>
      <Form onSubmit={event => {handleSubmit(event); setIsLoading(false);}}>
        <Form.Group>
          <Form.Label as='h4'>Current Password</Form.Label>
          <Form.Control
            type='password'
            name='oldPassword'
            className='mx-auto'
            maxLength={1024}
            required
          />
          <small className='text-danger' id='invalidCreds'></small>
        </Form.Group>
        {type === 'password' ? <>
          <Form.Group>
            {newPasswordConfirm}
          </Form.Group>
        </> : <>
          <Form.Group>
            <Form.Label as='h4'>New Email</Form.Label>
            <Form.Control
              type='email'
              name='newEmail'
              className='mx-auto'
              maxLength={64}
              required
            />
            <small className='text-danger' id='emailTaken'></small>
          </Form.Group>
        </>}
        <Button type='submit' className='my-5' block>
          {isLoading ? 'Loading...' : 'Update'}
        </Button>
      </Form>
    </>);
  }
}
