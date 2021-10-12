import React from 'react';
import Button from 'react-bootstrap/Button';

export function MainHook({ onClick }) {
  return (
    <>
      <h1>Learn Anything.  Remember Everything.</h1>
      <p className='lead'>
        Flashcards that automatically optimize when you should review them<br />
        Spend less time studying, and get more out of it
      </p>
      <Button
        type='submit'
        className='mt-1'
        style={{ width: '250px' }}
        onClick={onClick}
        id='main-signup-btn'
      >
        Sign Up
      </Button>
      <div className='mt-5'>
        <p className='text-secondary mb-1'>Already have an account? Log-in instead</p>
        <Button
          variant='outline-primary'
          href='/login/'
          className='px-4'
        >
          Login
        </Button>
      </div>
    </>
  );
}
