import RegisterModal from ".";
import withFullContext from "@/helpers/withFullContext";
import useGlobalModalStore from "@/stores/globalModalStore";
import { ComponentStory } from "@storybook/react";
import { useEffect } from "react";

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
