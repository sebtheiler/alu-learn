import RenderMainSection from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";

const mainSection = {
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
  title: "Components/RenderMainSection",
  component: RenderMainSection,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof RenderMainSection> = (args) => (
  <RenderMainSection {...args} />
);

export const RenderMainSectionExample = Template.bind({});
RenderMainSectionExample.args = {
  mainSection: mainSection,
};
