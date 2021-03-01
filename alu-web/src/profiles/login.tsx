import React from 'react';
import { LoginForm } from '../landing/forms';

export function LoginComponent(_props) {
  return (
    <>
      <h2 className='text-center'>Log-in</h2>
      <div className='w-50 mx-auto'>
        <LoginForm />
      </div>
    </>
  );
}
