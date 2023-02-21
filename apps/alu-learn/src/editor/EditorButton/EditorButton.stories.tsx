import EditorButton from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Lexicaleditor/EditorButton",
  component: EditorButton,
};

const Template: ComponentStory<typeof EditorButton> = (args) => (
  <EditorButton {...args} />
);

export const EditorButtonExample = Template.bind({});
EditorButtonExample.args = {};
