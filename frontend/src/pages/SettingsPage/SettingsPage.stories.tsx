import SettingsPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

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
