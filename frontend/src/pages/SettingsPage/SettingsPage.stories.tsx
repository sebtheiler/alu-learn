import SettingsPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/SettingsPage",
  component: SettingsPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof SettingsPage> = (args) => (
  <SettingsPage {...args} />
);

export const SettingsPageExample = Template.bind({});
SettingsPageExample.parameters = {
  layout: "fullscreen",
};
