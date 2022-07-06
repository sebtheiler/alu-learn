import GlobalContext from './global';
import LandingPage from 'pages/LandingPage';
import Navbar from '@components/Navbar';
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

  return (
    <div className="App">
      <GlobalContext.Provider value={contextVal}>
        <Navbar isLoggedIn={false} />
        <LandingPage />
      </GlobalContext.Provider>
    </div>
  );
}

export default App;
