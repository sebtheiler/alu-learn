import ButtonGroup from ".";
import { ComponentStory } from "@storybook/react";
import Button from "atoms/Button";

export default {
  title: "Atoms/ButtonGroup",
  component: ButtonGroup,
};

const Template: ComponentStory<typeof ButtonGroup> = (args) => (
  <ButtonGroup {...args}>
    <Button>Button #1</Button>
    <Button>Button #222222</Button>
    <Button>Button #3333</Button>
  </ButtonGroup>
);

export const Horizontal = Template.bind({});
Horizontal.args = {
  spaced: true,
};

export const FixedWidth = Template.bind({});
FixedWidth.args = {
  fixedWidth: "200px",
  spaced: true,
};
