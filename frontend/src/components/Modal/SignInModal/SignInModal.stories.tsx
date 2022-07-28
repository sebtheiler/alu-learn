import SignInModal from ".";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ComponentStory } from "@storybook/react";
import GlobalContext from "global";
import { withReactContext } from "storybook-react-context";

export default {
  title: "Components/Modal/SignInModal",
  decorators: [
    withReactContext({
      Context: GlobalContext,
      initialState: {
        logInModalOpen: true,
        setSignInModalOpen: () => console.log("setting value"),
      },
    }),
  ],
  component: SignInModal,
};

const Template: ComponentStory<typeof SignInModal> = () => (
  <GoogleOAuthProvider clientId={process.env.GOOGLE_OAUTH_CLIENT_ID as string}>
    <SignInModal />
  </GoogleOAuthProvider>
);

export const SignInModalExample = Template.bind({});
