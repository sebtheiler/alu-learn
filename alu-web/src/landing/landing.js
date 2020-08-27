import React, {useState} from 'react';
import {MainHook, CoolFeaturesList, RegisterForm} from './components';
import {HowItWorks} from './cards';

export function LandingComponent(props) {
  const {alphaSpotsRemaining, experimentId} = props;
  const [screenWidth, setScreenWidth] = useState(document.documentElement.clientWidth);

  console.log(experimentId)

  window.addEventListener("resize", (_event) => {
    setScreenWidth(document.documentElement.clientWidth);
  });

  const redirectToRegister = (email) => {
    window.location.href = '/register/' + (email ? `?email=${email}` : '');
  };

  return (
    <>
      <div className='row text-center'>
        <div className={screenWidth < 770 ? 'col-12' : 'col-6'}>
          <MainHook
            alphaSpotsRemaining={alphaSpotsRemaining}
            callback={redirectToRegister}
          />
        </div>
        <div className={screenWidth < 770 ? 'col-12 mt-4' : 'col-6'}>
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