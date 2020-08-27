import React, {useState} from 'react';
import {MainHook, CoolFeaturesList, RegisterForm} from './components';
import {HowItWorks} from './cards';

// TODO:
// Fix for mobile
// Build into Django
// Add A/B testing
// Add statistic tracking

export function LandingComponent(props) {
  const {alphaSpotsRemaining} = props;
  const [screenWidth, setScreenWidth] = useState(document.documentElement.clientWidth);

  window.addEventListener("resize", (_event) => {
    setScreenWidth(document.documentElement.clientWidth);
  });

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
            isMobile={screenWidth < 770}
          />
        </div>
        <div className='col-6'>
          <CoolFeaturesList />
        </div>
      </div>
      <div className='row' style={{marginTop: '100px'}}>
        <div className='text-center mx-auto'>
          <h2>Here's how it works</h2>
          <HowItWorks isMobile={screenWidth < 770} />

          <h2>Start Learning</h2>
          <RegisterForm callback={redirectToRegister} hideNoSpam />
        </div>
      </div>
    </>
  );
};