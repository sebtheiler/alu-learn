import CoursePage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "pages/CoursePage",
  component: CoursePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof CoursePage> = (args) => (
  <CoursePage {...args} />
);

export const CoursePageExample = Template.bind({});
CoursePageExample.parameters = {
  layout: "fullscreen",
};
