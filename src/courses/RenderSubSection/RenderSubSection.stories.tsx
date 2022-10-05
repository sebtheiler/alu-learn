import RenderSubSection from ".";
import withFullContext from "@/helpers/withFullContext";
import { ComponentStory } from "@storybook/react";

const courseSection = {
  id: "cl74urv9300087ai0udubgndr",
  title: "Hello",
  subSections: [],
};
const subSection = {
  id: "cl74xd4kj0025i8i0ewibo9ci",
  title: "My Subsection",
};

export default {
  title: "Courses/RenderSubSection",
  component: RenderSubSection,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof RenderSubSection> = (args) => (
  <RenderSubSection {...args} />
);

export const RenderSubSectionExample = Template.bind({});
RenderSubSectionExample.args = {
  subSection: subSection,
  courseSection: courseSection,
};
