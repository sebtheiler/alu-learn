import ProUpgradeSuccessPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/ProUpgradeSuccessPage",
  component: ProUpgradeSuccessPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradeSuccessPage> = () => (
  <ProUpgradeSuccessPage />
);

export const ProUpgradeSuccessPageExample = Template.bind({});
ProUpgradeSuccessPageExample.parameters = {
  layout: "fullscreen",
};
