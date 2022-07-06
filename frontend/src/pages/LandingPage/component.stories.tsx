import GlobalContext from '@global';
import { BrowserRouter } from 'react-router-dom';
import { ComponentStory } from '@storybook/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useMemo, useState } from 'react';

import Navbar from 'components/Navbar';
import LandingPage from '.';

export default {
  title: 'Pages/LandingPage',
  component: LandingPage,
  layout: 'fullscreen',
}


const Template: ComponentStory<typeof LandingPage> = (args) => {
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [logInModalOpen, setLogInModalOpen] = useState(false);
  const contextVal = useMemo(() => ({
    signUpModalOpen,
    setSignUpModalOpen,
    logInModalOpen,
    setLogInModalOpen,
  }), [signUpModalOpen, setSignUpModalOpen, logInModalOpen, setLogInModalOpen]);

  return (
    <BrowserRouter>
      <GlobalContext.Provider value={contextVal}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string}>
          <Navbar isLoggedIn={false} />
          <LandingPage />
        </GoogleOAuthProvider>
      </GlobalContext.Provider>
    </BrowserRouter>
  );
}


export const LandingPageExample = Template.bind({});
LandingPageExample.parameters = {
  layout: 'fullscreen',
}