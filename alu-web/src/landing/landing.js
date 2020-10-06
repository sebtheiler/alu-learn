import React, {useState, useEffect} from 'react';
import {MainHook, CoolFeaturesList, MiniRegisterForm} from './components';
import {HowItWorks} from './cards';
import {RegisterLoginModal} from './forms';
import {apiCreateBlankExperiment} from '../lookup';

// Experiments:
// (1) Apply button color
// (2) Order of 'main hook' and 'cool features'
// (3) Join us vs apply for alpha
// (4) Disable enter email field
// (5) It's free! instead of Register soon!
// (6)(7)
//   FF: Want to learn something new? 
//   FT: Need help learning something new?
//   TT: Looking for a new way to study?
//   TF: Need some new studying partners?
// (8) Remove Boldface in description
// (9) Hide FA icons


export function LandingComponent(props) {
  const {alphaSpotsRemaining, experimentParams, showLoginRequired, returnUrl, userIsNew} = props;

  const [screenWidth, setScreenWidth] = useState(document.documentElement.clientWidth);
  const [modalIsOpen, setModalIsOpen] = useState(showLoginRequired === 'true');
  const [currentEmail, setCurrentEmail] = useState('');
  const [sentUserIsNewData, setSentUserIsNewData] = useState(false);

  useEffect(() => {
    if (userIsNew && userIsNew.toLowerCase() === 'true' && sentUserIsNewData === false) {
      setSentUserIsNewData(true);
      apiCreateBlankExperiment('landing1', experimentParams, (_response, _status) => {
        // pass
      });
    };
  }, [experimentParams, userIsNew, sentUserIsNewData, setSentUserIsNewData]);

  const openModal = () => {
    setModalIsOpen(true);
  };
  
  const closeModal = () => {
    setModalIsOpen(false);
  };
  
  const openModalCallback = (email) => {
    setCurrentEmail(email);
    openModal();
  };

  // Used for dynamically changing object positioning
  window.addEventListener("resize", (_event) => {
    setScreenWidth(document.documentElement.clientWidth);
  });

  return (
    <>
      <div className='row text-center'>
        <RegisterLoginModal
          defaultEmail={currentEmail}
          modalIsOpen={modalIsOpen}
          closeModal={closeModal}
          returnUrl={returnUrl}
          experimentParams={experimentParams}
        />
        <div className={screenWidth < 770 ? 'col-12' : 'col-6'}>
          {
            experimentParams[1] === '1' ? 
            <CoolFeaturesList experimentParams={experimentParams} />
            :
            <MainHook
              alphaSpotsRemaining={alphaSpotsRemaining}
              callback={openModalCallback}
              experimentParams={experimentParams}
            />
          }
        </div>
        <div className={screenWidth < 770 ? 'col-12 mt-4' : 'col-6'}>
          {
            experimentParams[1] === '1' ? 
            <MainHook
              alphaSpotsRemaining={alphaSpotsRemaining}
              callback={openModalCallback}
              experimentParams={experimentParams}
            />
            :
            <CoolFeaturesList experimentParams={experimentParams} />
          }
        </div>
      </div>
      <div className='row' style={{marginTop: '100px'}}>
        <div className='text-center mx-auto'>
          {/* <h2>Here's how it works</h2>
          <HowItWorks isMobile={screenWidth < 770} experimentParams={experimentParams} /> */}

          {/* <h2>Start Learning</h2>
          <MiniRegisterForm
            callback={openModalCallback}
            experimentParams={experimentParams}
            autoFocus={false}
            hideNoSpam
          /> */}
        </div>
      </div>
    </>
  );
};