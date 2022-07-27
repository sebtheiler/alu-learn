import Tooltip from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/Tooltip",
  component: Tooltip,
};

const Template: ComponentStory<typeof Tooltip> = (args) => (
  <>
    Hover over{" "}
    <Tooltip {...args}>
      <strong>this word</strong>
    </Tooltip>{" "}
    to see a tooltip
  </>
);

export const TooltipExample = Template.bind({});
TooltipExample.args = {
  tooltip: "Example Tooltip Here",
  className: "w-32",
};
