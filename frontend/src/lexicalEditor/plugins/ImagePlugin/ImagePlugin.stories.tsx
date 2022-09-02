import ImagePlugin from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Lexicaleditor/Plugins/ImagePlugin",
  component: ImagePlugin,
};

const Template: ComponentStory<typeof ImagePlugin> = (args) => (
  <ImagePlugin {...args} />
);

export const ImagePluginExample = Template.bind({});
ImagePluginExample.args = {};
