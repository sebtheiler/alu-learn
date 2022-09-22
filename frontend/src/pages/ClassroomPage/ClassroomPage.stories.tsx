import ClassroomPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/ClassesPage",
  component: ClassroomPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ClassroomPage> = (args) => (
  <ClassroomPage {...args} />
);

export const ClassesPageExample = Template.bind({});
ClassesPageExample.parameters = {
  layout: "fullscreen",
};
