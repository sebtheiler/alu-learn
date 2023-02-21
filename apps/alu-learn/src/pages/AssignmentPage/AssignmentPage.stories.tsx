import AssignmentPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/AssignmentPage",
  component: AssignmentPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof AssignmentPage> = (args) => (
  <AssignmentPage {...args} />
);

export const AssignmentPageExample = Template.bind({});
AssignmentPageExample.parameters = {
  layout: "fullscreen",
};
