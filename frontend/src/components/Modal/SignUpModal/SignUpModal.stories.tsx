import SignUpModal from ".";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ComponentStory } from "@storybook/react";
import GlobalContext from "global";
import { withReactContext } from "storybook-react-context";

export default {
  title: "Components/Modal/SignUpModal",
  decorators: [
    withReactContext({
      Context: GlobalContext,
      initialState: {
        signUpModalOpen: true,
        setSignUpModalOpen: () => console.log("setting value"),
      },
    }),
  ],
  component: SignUpModal,
};

const Template: ComponentStory<typeof SignUpModal> = () => (
  <GoogleOAuthProvider clientId={process.env.GOOGLE_OAUTH_CLIENT_ID as string}>
    <SignUpModal />
  </GoogleOAuthProvider>
);

export const SignUpModalExample = Template.bind({});
