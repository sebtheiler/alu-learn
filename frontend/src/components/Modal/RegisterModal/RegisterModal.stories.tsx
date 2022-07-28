import RegisterModal from ".";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ComponentStory } from "@storybook/react";
import GlobalContext from "global";
import { withReactContext } from "storybook-react-context";

export default {
  title: "Components/Modal/RegisterModal",
  decorators: [
    withReactContext({
      Context: GlobalContext,
      initialState: {
        registerModalOpen: true,
        setRegisterModalOpen: () => console.log("setting value"),
      },
    }),
  ],
  component: RegisterModal,
};

const Template: ComponentStory<typeof RegisterModal> = () => (
  <GoogleOAuthProvider clientId={process.env.GOOGLE_OAUTH_CLIENT_ID as string}>
    <RegisterModal />
  </GoogleOAuthProvider>
);

export const RegisterModalExample = Template.bind({});
