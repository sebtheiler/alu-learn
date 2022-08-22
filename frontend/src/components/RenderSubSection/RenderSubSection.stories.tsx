import RenderSubSection from ".";
import { ComponentStory } from "@storybook/react";

const mainSection = {
  id: "cl74urv9300087ai0udubgndr",
  title: "Hello",
  subSections: [],
};
const subSection = {
  id: "cl74xd4kj0025i8i0ewibo9ci",
  title: "My Subsection",
};

export default {
  title: "Components/RenderSubSection",
  component: RenderSubSection,
};

const Template: ComponentStory<typeof RenderSubSection> = (args) => (
  <RenderSubSection {...args} />
);

export const RenderSubSectionExample = Template.bind({});
RenderSubSectionExample.args = {
  subSection: subSection,
  mainSection: mainSection,
};
