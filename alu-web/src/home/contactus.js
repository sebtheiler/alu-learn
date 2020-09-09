import React from 'react';
import {Form, Button} from 'react-bootstrap';
import { FormCheckbox } from '../utils';

export function ContactUs(props) {
  const {userIsAuthenticated} = {userIsAuthenticated : true }//props;

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;

    console.log(
      form.title.value,
      form.description.value,
      form.errorCode.value,
      userIsAuthenticated ? form.allowUsToContactYou.checked : null,
      !userIsAuthenticated ? form.email.value : null,
    );
  };

  return (
    <Form onSubmit={handleSubmit} className='w-75 mx-auto'>
      <Form.Group>
        <Form.Label className='mb-0'>
          Short Description<br />
          <small className='text-secondary'>
            Summarize your problem or suggestion in a few words
          </small>
        </Form.Label>
        <Form.Control
          type='text'
          name='title'
          placeholder="My flashcards aren't loading"
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className='mb-0'>
          Full Description<br />
          <small className='text-secondary'>
            Please be as elaborate as possible. Describe what you were doing when the problem occured and if it has happened before.{' '}
            If possible, please also include information about your computer and browser (e.g., Google Chrome on Windows 10 64bit).
          </small>
        </Form.Label>
        <Form.Control
          as='textarea'
          name='description'
          placeholder="After I ... then, ... happened and ..."
          rows='10'
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className='mb-0'>
          Error Code (optional)<br />
          <small className='text-secondary'>
            If you recieved an error code, please specify it here
          </small>
        </Form.Label>
        <Form.Control type='text' placeholder="bb8-194" name='errorCode' />
      </Form.Group>
      <Form.Group>
        {userIsAuthenticated ? <>
          <FormCheckbox name='allowUsToContactYou'>
            Allow us to contact you?<br />
            <small className='text-secondary'>
              By checking this box, you allow us to email you, and are bound to our{' '}
              <a href='/legal/tos'>Terms of Service</a> and <a href='/legal/privacypolicy'>Privacy Policy</a>.
            </small>
          </FormCheckbox>
        </> : <>
          <Form.Label className='mb-0'>
            Email addresss for further contact (optional)<br />
            <small className='text-secondary'>
              By filling in this field, you allow us to email you, and are bound to our{' '}
              <a href='/legal/tos'>Terms of Service</a> and <a href='/legal/privacypolicy'>Privacy Policy</a>.
            </small>
          </Form.Label>
          <Form.Control type='email' placeholder="email@company.com" name='email' />
        </>}
      </Form.Group>
      <Button type='submit' block>Submit</Button>
    </Form>
  );
};