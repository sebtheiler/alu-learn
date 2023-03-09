import AdminPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/AdminPage",
  component: AdminPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof AdminPage> = (args) => (
  <AdminPage {...args} />
);

export const AdminPageExample = Template.bind({});
AdminPageExample.parameters = {
  layout: "fullscreen",
};
