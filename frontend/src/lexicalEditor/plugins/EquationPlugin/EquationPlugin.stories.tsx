import EquationPlugin from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Lexicaleditor/Plugins/EquationPlugin",
  component: EquationPlugin,
};

const Template: ComponentStory<typeof EquationPlugin> = (args) => (
  <EquationPlugin {...args} />
);

export const EquationPluginExample = Template.bind({});
EquationPluginExample.args = {};
