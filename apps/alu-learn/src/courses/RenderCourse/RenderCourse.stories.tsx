import RenderCourse from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Courses/RenderCourse",
  component: RenderCourse,
};

const Template: ComponentStory<typeof RenderCourse> = (args) => (
  <RenderCourse {...args} />
);

export const RenderCourseExample = Template.bind({});
RenderCourseExample.args = {};
