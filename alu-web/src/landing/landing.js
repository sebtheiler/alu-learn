import React, {useState} from 'react';
import {MainHook, CoolFeaturesList, RegisterForm} from './components';
import {HowItWorks} from './cards';
import {RegisterLoginModal} from './forms';

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
  const {alphaSpotsRemaining, experimentId} = props;

  const [screenWidth, setScreenWidth] = useState(document.documentElement.clientWidth);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');

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
        />
        <div className={screenWidth < 770 ? 'col-12' : 'col-6'}>
          {
            experimentId[1] === '1' ? 
            <CoolFeaturesList experimentId={experimentId} />
            :
            <MainHook
              alphaSpotsRemaining={alphaSpotsRemaining}
              callback={openModalCallback}
              experimentId={experimentId}
            />
          }
        </div>
        <div className={screenWidth < 770 ? 'col-12 mt-4' : 'col-6'}>
          {
            experimentId[1] === '1' ? 
            <MainHook
              alphaSpotsRemaining={alphaSpotsRemaining}
              callback={openModalCallback}
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
            callback={openModalCallback}
            experimentId={experimentId}
            autoFocus={false}
            hideNoSpam
          />
        </div>
      </div>
    </>
  );
};