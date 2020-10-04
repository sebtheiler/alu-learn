import React, {useState} from 'react';
import {Form, Button} from 'react-bootstrap';
import { FormCheckbox, errorHandler } from '../utils';
import {apiFeedbackSubmit} from '../lookup';

export function ContactUs(props) {
  const userIsAuthenticated = props.userIsAuthenticated ? props.userIsAuthenticated.toLowerCase() === 'true' : false;
  const isLegalIssue = props.isLegalIssue ? props.isLegalIssue.toLowerCase() === 'true' : false;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.target;

    apiFeedbackSubmit(
      form.title.value,
      form.description.value,
      !isLegalIssue ? form.errorCode.value : null,
      !isLegalIssue ? form.urgency.value : 11,
      !userIsAuthenticated ? form.email.value : null,
      userIsAuthenticated && !isLegalIssue ? form.allowUsToContactYou.checked : form.email.value.length > 0,
      isLegalIssue,
      (response, status) => {
        if (status === 201) {
          window.location.href = 'finished/';
        } else {
          // Error submitting feedback
          errorHandler(response, status, 4000);
        };
        setIsLoading(false);
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit} className='w-75 mx-auto'>
      <Form.Group>
        <Form.Label className='mb-0'>
          Short Description<br />
          <small className='text-secondary'>
            Summarize your problem or {!isLegalIssue ? ' suggestion' : 'request'} in a few words
          </small>
        </Form.Label>
        <Form.Control
          type='text'
          name='title'
          placeholder={!isLegalIssue ? "My flashcards aren't loading" : ''}
          maxLength={80}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className='mb-0'>
          Full Description<br />
          <small className='text-secondary'>
            Please be as elaborate as possible.
            {isLegalIssue ?
            <> Furthermore, please take a moment to familiarize yourself with our
            {' '}<a href='/legal/tos'>Terms of Service</a> and <a href='/legal/privacypolicy'>Privacy Policy</a>.</>
            :
            <> Describe what you were doing when the problem occured and if it has happened before. 
            If possible, please also include information about your computer and browser (e.g., Google Chrome on Windows 10 64bit).</>
            }
          </small>
        </Form.Label>
        <Form.Control
          as='textarea'
          name='description'
          placeholder={!isLegalIssue ? "After I ... then, ... happened and ..." : ''}
          rows='10'
          maxLength={4000}
          required
        />
      </Form.Group>
      {isLegalIssue ? null : <>
        <Form.Group>
          <Form.Label className='mb-0'>
            Error Code (optional)<br />
            <small className='text-secondary'>
              If you recieved an error code, please specify it here
            </small>
          </Form.Label>
          <Form.Control type='text' placeholder="bb8-194" name='errorCode' maxLength={8} />
        </Form.Group>
        <Form.Group>
          <Form.Label className='mb-0'>
            How urgent is this? (optional)<br />
            <small className='text-secondary'>
              0 is not urgent at all, 10 is very urgent. This helps us prioritize the most pressing issues. Please don't lie about this.
            </small>
          </Form.Label>
          <Form.Control type='number' name='urgency' min={0} max={10} />
        </Form.Group>
      </>}
      <Form.Group>
        {userIsAuthenticated && !isLegalIssue ? <>
          <FormCheckbox name='allowUsToContactYou'>
            Allow us to contact you? (optional)<br />
            <small className='text-secondary'>
              By checking this box, you allow us to email you, and are bound to our{' '}
              <a href='/legal/tos'>Terms of Service</a> and <a href='/legal/privacypolicy'>Privacy Policy</a>.
            </small>
          </FormCheckbox>
        </> : <>
          <Form.Label className='mb-0'>
            {!isLegalIssue ? 
              'Email addresss for further contact (optional)' :
              'Email address'
            } <br />
              <small className='text-secondary'>
                By filling in this field, you allow us to email you, and are bound to our{' '}
                <a href='/legal/tos'>Terms of Service</a> and <a href='/legal/privacypolicy'>Privacy Policy</a>.
              </small>
          </Form.Label>
          <Form.Control
            type='email'
            placeholder="email@company.com"
            name='email'
            maxLength={64}
            required={isLegalIssue}
          />
        </>}
      </Form.Group>
      <Button type='submit' block>{isLoading ? 'Loading...' : 'Submit'}</Button>
    </Form>
  );
};