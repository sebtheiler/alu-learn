import React from 'react';
import {Button, Form} from 'react-bootstrap';
import { apiEmailConfirm } from '../../lookup';
import {errorHandler} from '../../utils';


export function ConfirmEmail(props) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    console.log(form.elements.confirmationCode.value);
  };

  return (<>
    <h1 className='text-center mt-5'>
      Confirm Email
    </h1>
    <p className='text-center'>
      An email should have been sent to the email address you specified.
      Please enter the code to continue. <br />Make sure to check your "Spam" folder.
    </p>
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label as='h3'>Confirmation Code</Form.Label>
        <Form.Control
          type='text'
          name='confirmationCode'
        />
      </Form.Group>
      <Button type='submit' block>
        Confirm
      </Button>
    </Form>
  </>);
};