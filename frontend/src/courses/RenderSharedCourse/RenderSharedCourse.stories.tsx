import RenderSharedCourse from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Courses/RenderSharedCourse",
  component: RenderSharedCourse,
};

const Template: ComponentStory<typeof RenderSharedCourse> = (args) => (
  <RenderSharedCourse {...args} />
);

export const RenderSharedCourseExample = Template.bind({});
RenderSharedCourseExample.args = {};
