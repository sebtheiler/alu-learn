import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiStaffForceLogin } from '../lookup';
import { errorHandler, FormCheckbox } from '../utils';


export function StaffForceLogin(props) {
  const handleSubmit = event => {
    event.preventDefault();
    const form = event.target;

    console.log(form.elements.username.value);
    apiStaffForceLogin(form.elements.username.value, (response, status) => {
      if (status === 200) {
        window.location.href = '/home/';
      } else if (status === 420) {
        window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      } else {
        // Error logging staff into user account
        errorHandler(response, status, 3023);
      }
    });
  }

  return (<div className='container-fluid text-center mt-5'>
    <p>
      For anyone looking at this code: This form allows staff members to login to user's account for support reasons,
      and is only used in emergencies.<br />
      You can't access it, through the frontend or the backend, so don't bother trying.
    </p>
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Username</Form.Label>
        <Form.Control
          type='text'
          name='username'
          className='w-50 mx-auto'
        />
      </Form.Group>
      <Form.Group>
        <FormCheckbox required>I am only doing this because of an emergency</FormCheckbox>
      </Form.Group>
      <Button type='submit' block>Login</Button>
    </Form>
  </div>);
}
