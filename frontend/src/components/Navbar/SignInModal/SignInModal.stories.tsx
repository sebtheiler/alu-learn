import SignInModal from ".";
import withFullContext from "@/helpers/withFullContext";
import useGlobalModalStore from "@/stores/globalModalStore";
import { ComponentStory } from "@storybook/react";
import { useEffect } from "react";

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
