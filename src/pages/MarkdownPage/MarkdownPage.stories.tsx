import MarkdownPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/MarkdownPage",
  component: MarkdownPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof MarkdownPage> = (args) => (
  <MarkdownPage {...args} />
);

export const MarkdownPageExample = Template.bind({});
MarkdownPageExample.parameters = {
  layout: "fullscreen",
};
