import React, {useState} from 'react';
import {Modal, Form, Button} from 'react-bootstrap';
import {isAlphaNumeric, errorHandler, FormCheckbox} from '../../utils';
import {apiCheckUsernameAvailable, apiProfileCreate, apiProfileLogin} from '../../lookup';

export function ModalRegisterForm(props) {
  const {defaultEmail, experimentParams} = props;
  const returnUrl = props.returnUrl ? new URL(props.returnUrl).pathname : null;
  var monthRef, dateRef, yearRef;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isChild, setIsChild] = useState(false);
  const [birthMonth, setBirthMonth] = useState('UNSELECTED');
  const [birthDate, setBirthDate] = useState('UNSELECTED');
  const [birthYear, setBirthYear] = useState('UNSELECTED');

  const onBirthChangeHandler = (_event) => {
    // Check if the age is < 13 years old
    const month = monthRef.value;
    const date = dateRef.value;
    const year = yearRef.value;
    const now = new Date();

    setBirthMonth(month);
    setBirthDate(date);
    setBirthYear(year);

    if ((month !== 'UNSELECTED' && date !== 'UNSELECTED' && year !== 'UNSELECTED' &&
        now.getFullYear() - 13 <= new Date(year, month, date)) ||
        now.getFullYear() - 13 < year) {
      setIsChild(true);
    } else {
      setIsChild(false);
    };
  };

  const registerHandler = (event) => {
    event.preventDefault();
    if (isLoading) {
      return;
    };
    const form = event.target;

    // Everything has to be done in the callback because of async
    setIsLoading(true);
    apiCheckUsernameAvailable(form.elements.registerUsername.value, form.elements.registerEmail.value, (response, status) => {
      if (status === 200) {
        var error = false;
        // Check if username and email is available
        const usernameAvailable = response.username_is_available;
        const emailAvailable = response.email_is_available;
        if (!usernameAvailable) {
          document.getElementById('registerUsernameTakenError').innerText =
          'That username is already taken!'
          error = true;
        } else {
          document.getElementById('registerUsernameTakenError').innerText = '';
        };
        if (!emailAvailable) {
          document.getElementById('registerEmailTakenError').innerHTML = 
          'That email is already taken! Click <a href="/reset-password/">here</a> to reset your password.'
        } else {
          document.getElementById('registerEmailTakenError').innerHTML = '';
        };

        // Check that birthdate is specified
        if (
           birthMonth === 'UNSELECTED' ||
           birthDate === 'UNSELECTED' ||
           birthYear === 'UNSELECTED') {
            document.getElementById('dateError').innerText =
            'You must select your birthdate. Don\'t worry, this isn\'t public.'
          error = true;
        } else {
          document.getElementById('dateError').innerText = '';
        };    
    
        // Check that first and last names are valid
        if (!isChild && (
          form.elements.registerFirstName.value.length > 50 ||
          form.elements.registerLastName.value.length > 50 ||
          ['@','#','$'].some(el => form.elements.registerFirstName.value.includes(el)) ||
          ['@','#','$'].some(el => form.elements.registerLastName.value.includes(el)))) {
            document.getElementById('nameError').innerText =
            'Your name must be less than 50 characters and not contain special characters such as @, #, or $.'
            error = true;
        } else if (!isChild) {
          document.getElementById('nameError').innerText = '';
        };
    
        // Check is username is alphanumeric
        if (
          form.elements.registerUsername.value.length > 20 ||
          !isAlphaNumeric(form.elements.registerUsername.value)) {
            document.getElementById('registerUsernameError').innerText =
            `Your username must be less than 20 characters and only include
            alphanumeric characters, such as abcd1234`
            error = true;
        } else {
          document.getElementById('registerUsernameError').innerText = '';
        };
    
        // Check if password meets security requirements
        if (
          isAlphaNumeric(form.elements.registerPassword.value) ||
          form.elements.registerPassword.value.length < 8 ) {
            document.getElementById('registerPasswordLengthError').innerText =
            `Your password must be at least 8 characters and include
            special characters such as @, $, or !.`
            error = true;
        } else {
          document.getElementById('registerPasswordLengthError').innerText = '';
        };

        // Check that passwords are the same
        if (
          form.elements.registerPasswordConfirm.value !== form.elements.registerPassword.value) {
            document.getElementById('registerPasswordMatchError').innerText =
            'Your passwords don\'t match.'
            error = true;
        } else {
          document.getElementById('registerPasswordMatchError').innerText = '';
        };
        
        // If all went well, create new profile
        if (error) {
          setIsLoading(false);
          return;
        };

        apiProfileCreate(
          birthYear,
          birthMonth,
          birthDate,
          isChild ? '' : form.elements.registerFirstName.value,
          isChild ? '' : form.elements.registerLastName.value,
          form.elements.registerUsername.value,
          form.elements.registerEmail.value,
          form.elements.registerPassword.value,
          experimentParams,
          (response, status) => {
            if (status === 201) {
              apiProfileLogin(
                form.elements.registerUsername.value,
                form.elements.registerPassword.value,
                (response, status) => {
                  if (status === 200) {
                    window.location.href = returnUrl ? returnUrl : '/confirm-email/';
                  } else {
                    // Error logging-in the user
                    errorHandler(response, status, 3009);
                  };
                },
              );
            } else if (response.message === 'Email not allowed') {
              // If the user's email is not allowed
              document.getElementById('emailNotAllowed').innerHTML =
                `You email is not currently in the list of allowed emails.
                To apply, please fill out the
                <a href='https://forms.gle/7MNRvNfa4yfQinTL7' target='_blank' rel='noopener noreferrer'>
                Google Form</a>.`
            } else {
              // Error creating the user profile
              errorHandler(response, status, 3008);
            };
            setIsLoading(false);
          },
        );
      } else {
        // Error checking username availability
        errorHandler(response, status, 3007);
      };
    });
  };

  return (
    <Form onSubmit={registerHandler}>
      <Form.Group>
        <Form.Label className='mb-0'>Date of Birth</Form.Label>
        <p id='dateError' className='text-danger mb-0'></p>
        <div className='row'>
          <div className='col-4'>
            <Form.Control as="select" defaultValue="Month..." onChange={onBirthChangeHandler} ref={el => {monthRef = el}}>
              <option value='UNSELECTED'>
                Month...
              </option>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
                <option value={month} key={`month-${index}`}>
                  {month}
                </option>
              ))}
            </Form.Control>
          </div>
          <div className='col-4'>
            <Form.Control as="select" defaultValue="Date..." onChange={onBirthChangeHandler} ref={el => {dateRef = el}}>
              <option value='UNSELECTED'>
                Date...
              </option>
              {[...Array(31).keys()].map(dayNum => (
                <option value={dayNum + 1} key={`date-${dayNum}`}>
                  {dayNum + 1}
                </option>
              ))}
            </Form.Control>
          </div>
          <div className='col-4'>
            <Form.Control as="select" defaultValue="Year..." onChange={onBirthChangeHandler} ref={el => {yearRef = el}}>
              <option value='UNSELECTED'>
                Year...
              </option>
              {[...Array(120).keys()].map(year => (
                <option value={2020 - (year + 1)} key={`year-${year}`}>
                  {2020 - (year + 1)}
                </option>
              ))}
            </Form.Control>
          </div>
        </div>
      </Form.Group>
      {
        isChild ? null :
        <Form.Group>
          <div className='row'>
            <p id='nameError' className='text-danger mb-0'></p>
            <div className='col-6'>
              <Form.Label className='mb-0'>First Name</Form.Label>
              <Form.Control
                type='text'
                name='registerFirstName'
                maxLength={25}
                required
              />
            </div>
            <div className='col-6'>
              <Form.Label className='mb-0'>Last Name</Form.Label>
              <Form.Control
                type='text'
                name='registerLastName'
                maxLength={25}
              />
            </div>
          </div>
        </Form.Group>
      }
      <Form.Group>
        <Form.Label className='mb-0'>
          Username{' '}
          {isChild ? <small className='text-secondary'>Don't use your real name!</small> : null}
        </Form.Label>
        <p id='registerUsernameError' className='text-danger mb-0'></p>
        <p id='registerUsernameTakenError' className='text-danger mb-0'></p>
        <Form.Control
          type='text'
          name='registerUsername'
          maxLength={15}
          style={{textTransform: 'lowercase'}}
          required
        />
      </Form.Group>
      <Form.Group>
        <Form.Label className='mb-0'>
          {isChild ? 'Parent/guardian\'s email' : 'Email'}
        </Form.Label>
        <p id='registerEmailTakenError' className='text-danger mb-0'></p>
        <Form.Control
          type='email'
          name='registerEmail'
          defaultValue={defaultEmail}
          maxLength={100}
          required
        />
        <small className='text-danger' id='emailNotAllowed' />
      </Form.Group>
      <Form.Group>
        <div className='row'>
          <div className='col-6'>
            <Form.Label className='mb-0'>
              Password
            </Form.Label>
            <p id='registerPasswordLengthError' className='text-danger mb-0'></p>
            <Form.Control
              type='password'
              name='registerPassword'
              maxLength={512}
              required
            />
          </div>
          <div className='col-6'>
            <Form.Label className='mb-0'>
              Confirm Password
            </Form.Label>
            <p id='registerPasswordMatchError' className='text-danger mb-0'></p>
            <Form.Control
              type='password'
              name='registerPasswordConfirm'
              required
            />
          </div>
        </div>
      </Form.Group>
      <Form.Group>
        <FormCheckbox required={true}>
          I accept the <a href='/legal/tos/' target='_blank'>
          Terms of Service</a> and{' '}
          <a href='/legal/privacypolicy/' target='_blank'>
          Privacy Policy</a>.
        </FormCheckbox>
      </Form.Group>
      <Modal.Footer>
        <Button type='submit' variant='primary' block>
          {isLoading ? 'Loading...' : 'Sign Up'}
        </Button>
      </Modal.Footer>
    </Form>
  );
};