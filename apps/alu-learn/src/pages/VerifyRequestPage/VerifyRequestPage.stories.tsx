import VerifyRequestPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/VerifyRequestPage",
  component: VerifyRequestPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof VerifyRequestPage> = () => (
  <VerifyRequestPage />
);

export const VerifyRequestPageExample = Template.bind({});
VerifyRequestPageExample.parameters = {
  layout: "fullscreen",
};
