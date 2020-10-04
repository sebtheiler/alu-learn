import React from 'react';
import {Button, Form, Row, Col} from 'react-bootstrap';
import { apiPasswordChange, apiPasswordReset } from '../../lookup';
import {errorHandler} from '../../utils';


export function ChangePasswordEmail(props) {
  const type = props.type ? props.type : 'password';
  const isReset = props.isReset && props.isReset.toLowerCase() === 'true';
  const urlSearch = isReset && new URLSearchParams(window.location.search);
  const resetKey = isReset && urlSearch.get('k');
  const email = isReset && urlSearch.get('email');

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    if (isReset) {
      if (form.elements.newPassword.value !== form.elements.confirmPassword.value) {
        document.getElementById('passwordsDoNotMatch').innerHTML =
          `Passwords do not match`
        return;
      } else {
        document.getElementById('passwordsDoNotMatch').innerHTML = '';
      };

      apiPasswordReset(email, resetKey, form.elements.newPassword.value, (response, status) => {
        if (status === 200) {
          window.location.href = '/login/';
        } else if (response.message === 'Invalid reset key') {
          document.getElementById('invalidKey').innerHTML =
          `The reset link you followed doesn't appear to be working.
           Perhaps try resetting your password again.`
        } else {
          // Error resetting password
          errorHandler(response, status, 3018);
        };
      });
    } else {
      if (type === 'password') {
        if (form.elements.newPassword.value !== form.elements.confirmPassword.value) {
          document.getElementById('passwordsDoNotMatch').innerHTML =
            `Passwords do not match`
          return;
        } else {
          document.getElementById('passwordsDoNotMatch').innerHTML = '';
        };
        apiPasswordChange(form.elements.oldPassword.value, form.elements.newPassword.value, (response, status) => {
          if (status === 200) {
            window.location.href = '/login/';
          } else if (response.message === 'Invalid credentials') {
            document.getElementById('invalidCreds').innerHTML = `
              Your password appears to be incorrect. You can reset it
            <a href='/reset-password/'>here</a>.`
          } else {
            // Error changing password
            errorHandler(response, status, 3017);
          };
        });
      } else if (type === 'email') {
        console.log(
          form.elements.newEmail.value,
        );
      };
    };
  };

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
      <Form onSubmit={handleSubmit}>
        {newPasswordConfirm}
        <Button type='submit' className='my-5' block>Reset</Button>
      </Form>
    </>);
  } else {
    return (<>
      <h1 className='text-center mt-5'>
        Update {type[0].toUpperCase() + type.substring(1)}
      </h1>
      <Form onSubmit={handleSubmit}>
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
        <Button type='submit' className='my-5' block>Update</Button>
      </Form>
    </>);
  };
};