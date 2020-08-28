import React from 'react';
import {Form, Button, ListGroup, OverlayTrigger} from 'react-bootstrap';
import {generateTooltip} from '../utils';

export function RegisterForm(props) {
  const {callback, experimentId, hideNoSpam} = props;

  const emailRef = React.createRef();

  const onSubmit = (event) => {
    event.preventDefault();
    callback(emailRef.current.value);
  };

  return (
    <Form onSubmit={onSubmit} className='mb-0'>
      {experimentId[3] === '1' ? null :
      <>
        {hideNoSpam ? null :
          <Form.Label className='mb-0 mt-2'>
            <small className='text-secondary text-left'>
              No spam! We promise.{' '}
              <OverlayTrigger
                overlay={generateTooltip(
                  `We promse not to spam, sell, rent, or share
                  your email address without your explicit permission.`
                )}
                placement='right'
                delay={{ show: 20, hide: 800 }}
              >
                  <i className="fas fa-info-circle"></i>
              </OverlayTrigger>
            </small>
          </Form.Label>
        }
        <Form.Control
          type='email'
          placeholder='Enter your email'
          className='mx-auto'
          style={{width: '250px'}}
          ref={emailRef}
        />
      </>}
      <Button
        type='submit'
        variant={experimentId[0] === '1' ? 'success' : 'primary'}
        className='mt-1'
        style={{width: '250px'}}
      >
        {experimentId[2] === '1' ? 'Join Us' : 'Apply for the Alpha'}
      </Button>
    </Form>
  );
};

export function MainHook(props) {
  const {alphaSpotsRemaining, callback, experimentId} = props;

  return (
    <>
      <h1>
        {
          experimentId[5] === '1' ? (
            experimentId[6] === '1'
            ? 'Want to learn something new?'
            : 'Need help learning something new?'
            ) : (
            experimentId[6] === '1'
            ? 'Want a new way to study?'
            : 'Need some new studying partners?'
          )
        }
      </h1>
      <p>
        {
          experimentId[7] === '1'
            ? <>Whether you're a student, life-long learner,{' '}
              or both, Alu can help you takes notes and study.</>
            : <>Whether you're a <strong>student, life-long learner,</strong>{' '}
              or <strong>both</strong>, Alu can help you takes notes and study.</>
        }
      </p>
      <RegisterForm callback={callback} experimentId={experimentId} />
      <p className='text-secondary mt-1'>
        {experimentId[4] === '1' ?
          <>
            It's free
          </>
          :
          <>
            Only {alphaSpotsRemaining} spots remaining in the Alpha!<br />
            Register soon!
          </>
        }
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