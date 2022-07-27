import Popover from ".";
import { ComponentStory } from "@storybook/react";
import Button from "atoms/Button";

export default {
  title: "Atoms/Popover",
  component: Popover,
};

const Template: ComponentStory<typeof Popover> = (args) => (
  <>
    Hover/click over/on{" "}
    <Popover {...args}>
      <strong>this word</strong>
    </Popover>{" "}
    to see a popover
  </>
);

export const OnHover = Template.bind({});
OnHover.args = {
  popover: (
    <div>
      <p className="mb-3">All sorts of stuff</p>
      <Button block>wasd</Button>
    </div>
  ),
  trigger: "hover",
  className: "w-32",
};

export const OnClick = Template.bind({});
OnClick.args = {
  popover: (
    <div>
      <p className="mb-3">All sorts of stuff</p>
      <Button block>wasd</Button>
    </div>
  ),
  trigger: "click",
  className: "w-32",
};
