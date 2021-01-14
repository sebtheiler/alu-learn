import React, { useState } from 'react';
import { MainHook, IntroductionVideo, LandingArticle } from './components';
import { RegisterLoginModal } from './forms';


export function LandingComponent(props) {
  const {showLoginRequired, returnUrl} = props;

  const [screenWidth, setScreenWidth] = useState(document.documentElement.clientWidth);
  const [modalIsOpen, setModalIsOpen] = useState(showLoginRequired === 'true');

  // Used for dynamically changing object positioning
  window.addEventListener("resize", (_event) => {
    setScreenWidth(document.documentElement.clientWidth);
  });

  return (
    <>
      <div className='row text-center'>
        <RegisterLoginModal
          modalIsOpen={modalIsOpen}
          closeModal={() => setModalIsOpen(false)}
          returnUrl={returnUrl}
        />
        <div className={screenWidth < 770 ? 'col-12' : 'col-6'}>
          <MainHook onClick={() => setModalIsOpen(true)} />
        </div>
        <div className={screenWidth < 770 ? 'col-12 mt-4' : 'col-6'}>
          <IntroductionVideo />
        </div>
      </div>
      <div className='row' style={{ marginTop: '100px' }}>
        <div className='text-center mx-auto'>
          <iframe width="640" height="1423" frameborder="0" marginheight="0" marginwidth="0"
            title='Alu Apply Form'
            src="https://docs.google.com/forms/d/e/1FAIpQLSf_TIiDiIX_6vQbVFxiQJYwxjy2kpemtbGjD7MQ28rusDzNZQ/viewform?embedded=true"
          >Loading…</iframe>
        </div>
      </div>
      <div className='container mt-5'>
        <LandingArticle />
      </div>
    </>
  );
}
