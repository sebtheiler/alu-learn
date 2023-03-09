import ProUpgradePage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/ProUpgradePage",
  component: ProUpgradePage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof ProUpgradePage> = (args) => (
  <ProUpgradePage {...args} />
);

export const ProUpgradePageExample = Template.bind({});
ProUpgradePageExample.parameters = {
  layout: "fullscreen",
};
