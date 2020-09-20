import React from 'react';
import {Button, Form, Row, Col} from 'react-bootstrap';
import { apiPasswordChange } from '../../lookup';
import {errorHandler} from '../../utils';


export function ChangePasswordEmail(props) {
  const type = props.type ? props.type : 'password';

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

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
          <a href='/settings/resetpassword/'>here</a>.`
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

  return (<>
    <h1 className='text-center mt-5'>
      Update {type[0].toUpperCase() + type.substring(1)}
    </h1>
    <Form onSubmit={handleSubmit}>
      {type === 'password' ? <>
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
        <Form.Group>
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
        </Form.Group>
      </> : <>
        {/* TODO: Email change field */}
      </>}
      <Button type='submit' className='my-5' block>Update</Button>
    </Form>
  </>);
};