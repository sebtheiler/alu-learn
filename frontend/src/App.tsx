import AboutPage from 'pages/AboutPage';
import GlobalContext from './global';
import LandingPage from 'pages/LandingPage';
import Navbar from '@components/Navbar';
import ProPurchaseCancelledPage from 'pages/ProPurchaseCancelledPage';
import ProPurchaseSuccessPage from 'pages/ProPurchaseSuccessPage';
import ProUpgradePage from 'pages/ProUpgradePage';
import { Route, Routes } from 'react-router-dom';
import { useMemo, useState } from 'react';
import 'index.scss';
import 'main.scss';

function App() {
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [logInModalOpen, setLogInModalOpen] = useState(false);
  const contextVal = useMemo(() => ({
    signUpModalOpen,
    setSignUpModalOpen,
    logInModalOpen,
    setLogInModalOpen,
  }), [signUpModalOpen, setSignUpModalOpen, logInModalOpen, setLogInModalOpen]);

  const isLoggedIn = false;
  return (
    <div className='App'>
      <GlobalContext.Provider value={contextVal}>
        <Navbar isLoggedIn={isLoggedIn} />
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
          <Route path='/about' element={<AboutPage isLoggedIn={isLoggedIn} />} />
          <Route path='/pro' element={<ProUpgradePage isPro={false} isProFromOrg={false} isLoggedIn={isLoggedIn} />} />
          <Route path='/pro/success' element={<ProPurchaseSuccessPage />} />
          <Route path='/pro/cancelled' element={<ProPurchaseCancelledPage />} />
        </Routes>
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
