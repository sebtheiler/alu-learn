import { ComponentStory } from "@storybook/react";

import ButtonGroup from ".";
import Button from "components/Button";

export default {
  title: "Components/ButtonGroup",
  component: ButtonGroup,
};

const Template: ComponentStory<typeof ButtonGroup> = (args) => (
  <ButtonGroup {...args}>
    <Button>Button #1</Button>
    <Button>Button #2</Button>
    <Button>Button #3</Button>
  </ButtonGroup>
);

export const Horizontal = Template.bind({});
Horizontal.args = {
  spaced: true,
};
