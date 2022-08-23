import RenderCourseSection from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";

const courseSection = {
  id: "cl74urv9300087ai0udubgndr",
  title: "Hello",
  subSections: [
    {
      id: "cl74xd4kj0025i8i0ewibo9ci",
      title: "My Subsection",
    },
    {
      id: "cl74z7enn0515i8i0naqyd7hd",
      title: "Another Subsection",
    },
    {
      id: "cl74z84e60560i8i0mgyr8d7a",
      title: "Whatever",
    },
  ],
};

export default {
  title: "Components/RenderCourseSection",
  component: RenderCourseSection,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof RenderCourseSection> = (args) => (
  <RenderCourseSection {...args} />
);

export const RenderCourseSectionExample = Template.bind({});
RenderCourseSectionExample.args = {
  courseSection: courseSection,
};
