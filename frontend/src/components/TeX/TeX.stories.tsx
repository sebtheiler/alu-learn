import { ComponentStory } from "@storybook/react";

import TeX from ".";

export default {
  title: "Components/TeX",
  component: TeX,
};

const Template: ComponentStory<typeof TeX> = (args) => <TeX {...args} />;

export const QuadraticEquation = Template.bind({});
QuadraticEquation.args = {
  math: String.raw`\frac{-b \pm \sqrt{b^2 - 4ab}}{2a}`,
  block: true,
};

export const InvalidEquation = Template.bind({});
InvalidEquation.args = {
  math: String.raw`\frac{ a^2`,
  errorColor: "#D73737",
};
