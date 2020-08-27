import React from 'react';
import {MainHook, CoolFeaturesList, RegisterForm} from './components';
import {HowItWorks} from './cards';

export function LandingComponent(props) {
  const {alphaSpotsRemaining} = props;

  const redirectToRegister = (email) => {
    window.location.href = '/register/' + (email ? `?email=${email}` : '');
  };

  return (
    <>
      <div className='row text-center'>
        <div className='col-6'>
          <MainHook
            alphaSpotsRemaining={alphaSpotsRemaining}
            callback={redirectToRegister}
          />
        </div>
        <div className='col-6'>
          <CoolFeaturesList />
        </div>
      </div>
      <div className='row' style={{marginTop: '100px'}}>
        <div className='text-center mx-auto'>
          <h2>Here's how it works</h2>
          <HowItWorks />

          <h2>Start Learning</h2>
          <RegisterForm callback={redirectToRegister} hideNoSpam />
        </div>
      </div>
    </>
  );
};