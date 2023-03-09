import MarkdownPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/MarkdownPage",
  component: MarkdownPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof MarkdownPage> = (args) => (
  <MarkdownPage {...args} />
);

export const MarkdownPageExample = Template.bind({});
MarkdownPageExample.parameters = {
  layout: "fullscreen",
};
