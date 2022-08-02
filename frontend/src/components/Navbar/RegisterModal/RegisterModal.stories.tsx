import RegisterModal from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import { useEffect } from "react";
import useGlobalModalStore from "stores/globalModalStore";

export default {
  title: "Components/NavbarModals/RegisterModal",
  decorators: [withFullContext],
  component: RegisterModal,
};

const Template: ComponentStory<typeof RegisterModal> = () => {
  const { setRegisterModalOpen } = useGlobalModalStore();
  useEffect(() => setRegisterModalOpen(true), [setRegisterModalOpen]);

  return <RegisterModal />;
};

export const RegisterModalExample = Template.bind({});
