import ToolsPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/ToolsPage",
  component: ToolsPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ToolsPage> = (args) => (
  <ToolsPage {...args} />
);

export const ToolsPageExample = Template.bind({});
ToolsPageExample.parameters = {
  layout: "fullscreen",
};
