import ToolbarPlugin from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "LexicalEditor/Plugins/ToolbarPlugin",
  component: ToolbarPlugin,
};

const Template: ComponentStory<typeof ToolbarPlugin> = (args) => (
  <ToolbarPlugin {...args} />
);

export const ToolbarExample = Template.bind({});
ToolbarExample.args = {};
