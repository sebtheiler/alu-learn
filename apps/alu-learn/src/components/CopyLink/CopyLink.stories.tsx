import CopyLink from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/CopyLink",
  component: CopyLink,
};

const Template: ComponentStory<typeof CopyLink> = (args) => (
  <CopyLink {...args} />
);

export const CopyLinkExample = Template.bind({});
CopyLinkExample.args = {};
