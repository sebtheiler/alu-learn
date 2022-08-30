import LexicalEditor from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "LexicalEditor/LexicalEditor",
  component: LexicalEditor,
};

const Template: ComponentStory<typeof LexicalEditor> = (args) => (
  <LexicalEditor {...args} />
);

export const LexicalEditorExample = Template.bind({});
LexicalEditorExample.args = {
  namespace: "Test editor",
};
