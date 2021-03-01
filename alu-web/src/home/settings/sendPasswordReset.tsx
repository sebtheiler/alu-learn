import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { apiSendPasswordReset } from '../../lookup';
import { errorHandler } from '../../utils';


export function SendPasswordReset(props) {
  const [sentEmail, setSentEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading === false) {
      setLoading(true);
      const form = event.target;
  
      apiSendPasswordReset(form.elements.email.value, (response, status) => {
        if (status === 200) {
          setSentEmail(true);
        } else if (response.message === 'Email not found') {
          // Invalid code
          document.getElementById('invalidEmail')!.innerHTML = 
            `We don't recognize that email`
        } else {
          // Error confirming email
          errorHandler(response, status, 3019);
        }
        setLoading(false);
      });
    }
  }

  return (<>
    <h1 className='text-center mt-5'>
      Reset Password
    </h1>
    {sentEmail ? <>
      <p className='text-center'>
        An email should be on its way to your account shortly.  If you don't see it within a few minutes,
        please check in your "Spam" folder or reload this page and try again.
      </p>
    </>
    : <>
      <p className='text-center'>
        Please specify your email below so we can send you a reset-password link.
      </p>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label as='h3'>Email</Form.Label>
          <Form.Control
            type='email'
            name='email'
            required
          />
          <p className='text-danger' id='invalidEmail'></p>
        </Form.Group>
        <Button type='submit' block>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </Form>
    </>}</>
  );
}
