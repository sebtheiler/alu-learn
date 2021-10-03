import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiEmailConfirm } from '../../lookup';
import { errorHandler } from '../../utils';


export function ConfirmEmail({ username, email }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    apiEmailConfirm(username, form.elements.confirmationCode.value, email, (response, status) => {
      if (status === 200) {
        window.location.href = '/help/welcome/';
      } else if (response.message === 'Confirmation key invalid') {
        // Invalid code
        document.getElementById('invalidCode')!.innerHTML = 
          `Invalid confirmation code`
      } else {
        // Error confirming email
        errorHandler(response, status, 3017);
      }
    });
  }

  return (<>
    <h1 className='text-center mt-5'>
      Confirm Email for "{username}"
    </h1>
    <p className='text-center'>
      An email should have been sent to {email}.
      Please enter the code to continue. <br />Make sure to check your "Spam" folder.
    </p>
    <p className='text-center'>
      Incorrect email? Change your email <a href='/settings/change-email/'>here</a>.
    </p>
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label as='h3'>Confirmation Code</Form.Label>
        <Form.Control
          type='text'
          name='confirmationCode'
          required
        />
        <p className='text-danger' id='invalidCode'></p>
      </Form.Group>
      <Button type='submit' id='confirm-email-btn' block>
        Confirm
      </Button>
    </Form>
  </>);
}
