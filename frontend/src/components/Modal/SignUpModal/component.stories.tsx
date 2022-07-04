import GlobalContext from '@global';
import { ComponentStory } from '@storybook/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { withReactContext } from 'storybook-react-context';

import SignUpModal from '.';

export default {
  title: 'Components/Modal/SignUpModal',
  decorators: [
    withReactContext({
      Context: GlobalContext,
      initialState: { 
        signUpModalOpen: true,
        setSignUpModalOpen: () => console.log('setting value'),
      },
    }),
  ],
  component: SignUpModal,
}

const Template: ComponentStory<typeof SignUpModal> = () => (
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string}>
    <SignUpModal />
  </GoogleOAuthProvider>
);

export const SignUpModalExample = Template.bind({});
