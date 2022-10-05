import ClozeComponent from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Editor/Plugins/Cloze",
  component: ClozeComponent,
};

const Template: ComponentStory<typeof ClozeComponent> = (args) => (
  <>
    The mitochondria is the <ClozeComponent {...args} /> of the cell
  </>
);

export const AnswerHidden = Template.bind({});
AnswerHidden.args = {
  attributes: {},
  children: <>powerhouse</>,
  revealAnswer: false,
};

export const AnswerRevealed = Template.bind({});
AnswerRevealed.args = {
  attributes: {},
  children: <>powerhouse</>,
  revealAnswer: true,
};
