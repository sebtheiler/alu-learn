import VerifyRequestPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/VerifyRequestPage",
  component: VerifyRequestPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof VerifyRequestPage> = () => (
  <VerifyRequestPage />
);

export const VerifyRequestPageExample = Template.bind({});
VerifyRequestPageExample.parameters = {
  layout: "fullscreen",
};
