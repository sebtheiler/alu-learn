import React, {useState} from 'react';
import {MainHook, CoolFeaturesList, RegisterForm} from './components';
import {HowItWorks} from './cards';

// Experiments:
// (1) Apply button color
// (2) Order of 'main hook' and 'cool features'
// (3) Join us vs apply for alpha
// (4) Disable enter email field
// (5) It's free! instead of Register soon!
// (6)(7)
//   FF: Want to learn something new? 
//   FT: Need help learning something new?
//   TT: Want a new way to study?
//   TF: Need some new studying partners?
// (8) Remove Boldface in description
// (9) Hide FA icons


export function LandingComponent(props) {
  const {alphaSpotsRemaining, experimentId} = props;
  const userAgent = props.userAgent.replace(/'/g, '"').replace(/False/g, 'false').replace(/True/g, 'true')
  const [screenWidth, setScreenWidth] = useState(document.documentElement.clientWidth);

  console.log(experimentId)
  console.log(userAgent)
  console.log(JSON.parse(userAgent))

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
          {
            experimentId[1] === '1' ? 
            <CoolFeaturesList experimentId={experimentId} />
            :
            <MainHook
              alphaSpotsRemaining={alphaSpotsRemaining}
              callback={redirectToRegister}
              experimentId={experimentId}
            />
          }
        </div>
        <div className={screenWidth < 770 ? 'col-12 mt-4' : 'col-6'}>
          {
            experimentId[1] === '1' ? 
            <MainHook
              alphaSpotsRemaining={alphaSpotsRemaining}
              callback={redirectToRegister}
              experimentId={experimentId}
            />
            :
            <CoolFeaturesList experimentId={experimentId} />
          }
        </div>
      </div>
      <div className='row' style={{marginTop: '100px'}}>
        <div className='text-center mx-auto'>
          <h2>Here's how it works</h2>
          <HowItWorks isMobile={screenWidth < 770} experimentId={experimentId} />

          <h2>Start Learning</h2>
          <RegisterForm
            callback={redirectToRegister}
            experimentId={experimentId}
            hideNoSpam
          />
        </div>
      </div>
    </>
  );
};