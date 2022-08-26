import ProUpgradeCancelledPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/ProUpgradeCancelledPage",
  component: ProUpgradeCancelledPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProUpgradeCancelledPage> = () => (
  <ProUpgradeCancelledPage />
);

export const ProUpgradeCancelledPageExample = Template.bind({});
ProUpgradeCancelledPageExample.parameters = {
  layout: "fullscreen",
};
