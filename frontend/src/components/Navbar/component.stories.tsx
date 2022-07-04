import GlobalContext from '@global';
import { BrowserRouter } from 'react-router-dom';
import { ComponentStory } from '@storybook/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useMemo, useState } from 'react';

import Navbar from '.';

export default {
  title: 'Components/Navbar',
  component: Navbar,
}

const Template: ComponentStory<typeof Navbar> = (args) => {
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
          <Navbar {...args} />
        </GoogleOAuthProvider>
      </GlobalContext.Provider>
    </BrowserRouter>
  );
}

export const NotLoggedIn = Template.bind({});
NotLoggedIn.args = {
  isLoggedIn: false,
};

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  isLoggedIn: true,
  streak: {
    currentStreak: 10,
    doneReviewsToday: true,
  },
  username: 'username',
  isPro: true,
};
