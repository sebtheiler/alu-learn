import LogInModal from ".";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ComponentStory } from "@storybook/react";
import GlobalContext from "global";
import { withReactContext } from "storybook-react-context";

export default {
  title: "Components/Modal/LogInModal",
  decorators: [
    withReactContext({
      Context: GlobalContext,
      initialState: {
        logInModalOpen: true,
        setLogInModalOpen: () => console.log("setting value"),
      },
    }),
  ],
  component: LogInModal,
};

const Template: ComponentStory<typeof LogInModal> = () => (
  <GoogleOAuthProvider clientId={process.env.GOOGLE_OAUTH_CLIENT_ID as string}>
    <LogInModal />
  </GoogleOAuthProvider>
);

export const LogInModalExample = Template.bind({});
