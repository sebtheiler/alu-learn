import SignInModal from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import { useEffect } from "react";
import useGlobalModalStore from "stores/globalModalStore";

export default {
  title: "Components/NavbarModals/SignInModal",
  decorators: [withFullContext],
  component: SignInModal,
};

const Template: ComponentStory<typeof SignInModal> = () => {
  const { setSignInModalOpen } = useGlobalModalStore();
  useEffect(() => setSignInModalOpen(true), [setSignInModalOpen]);

  return <SignInModal />;
};

export const SignInModalExample = Template.bind({});
