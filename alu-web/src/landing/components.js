import React from 'react';
import {Form, Button, ListGroup} from 'react-bootstrap';

export function RegisterForm(props) {
  const {callback, hideNoSpam} = props;

  const emailRef = React.createRef();

  const onSubmit = (event) => {
    event.preventDefault();
    callback(emailRef.current.value);
  };

  return (
    <Form onSubmit={onSubmit}>
      <Form.Group>
        {hideNoSpam ? null :
          <Form.Label className='mb-0 mt-2'><small className='text-secondary text-left'>
            No spam! We promise.
          </small></Form.Label>
        }
        <Form.Control
          type='email'
          placeholder='Enter your email'
          className='mx-auto'
          style={{width: '250px'}}
          ref={emailRef}
        />
        <Button
          type='submit'
          variant='primary'
          className='mt-1'
          style={{width: '250px'}}
        >
          Apply for the Alpha
        </Button>
      </Form.Group>
    </Form>
  );
};

export function MainHook(props) {
  const {alphaSpotsRemaining, callback} = props;

  return (
    <>
      <h1>Want to learn something new?</h1>
      <p>
        Whether you're a <strong>student, life-long learner,</strong>{' '}
        or <strong>both</strong>, Alu can help you takes notes and study.
      </p>
      <RegisterForm callback={callback} />
      <p className='text-secondary mt-3'>
        Only {alphaSpotsRemaining} spots remaining in the Alpha!<br />
        Register soon!
      </p>
      <div className='mt-5'>
        <p className='text-secondary mb-1'>Already have an account? Log-in instead</p>
        <Button
          variant='outline-primary'
          href='/login/'
          className='px-4'
        >Login</Button>
      </div>
    </>
  );
};

export function CoolFeaturesList(_props) {
  // const {} = props;

  return (
    <ListGroup className='text-left w-75 mx-auto'>
      <ListGroup.Item className='py-5 px-5'>
        <i className="fas fa-brain" style={{width: '25px', color: '#E292C0'}}></i>
         Take digital notes
      </ListGroup.Item>
      <ListGroup.Item className='py-5 px-5'>
        <i className="fas fa-chess-knight" style={{width: '25px', color: '#82C91E'}}></i>
         Focus on what you need most with powerful <em>spaced repetition</em>
      </ListGroup.Item>
      <ListGroup.Item className='py-5 px-5'>
        <i className="fas fa-users" style={{width: '25px', color: '#FBA129'}}></i>
         Interact with a community of dedicated learners
      </ListGroup.Item>
    </ListGroup>
  );
};