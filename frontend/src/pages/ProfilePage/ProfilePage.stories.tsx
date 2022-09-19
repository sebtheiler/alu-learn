import ProfilePage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/ProfilePage",
  component: ProfilePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ProfilePage> = (args) => (
  <ProfilePage {...args} />
);

export const ProfilePageExample = Template.bind({});
ProfilePageExample.parameters = {
  layout: "fullscreen",
};
