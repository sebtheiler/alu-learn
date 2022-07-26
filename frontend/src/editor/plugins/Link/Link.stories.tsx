import { ComponentStory } from "@storybook/react";

import { LinkComponent } from ".";

export default {
  title: "editor/plugins/LinkComponent",
  component: LinkComponent,
};

const Template: ComponentStory<typeof LinkComponent> = (args) => (
  <LinkComponent {...args} />
);

export const ExampleLink = Template.bind({});
ExampleLink.args = {
  attributes: {},
  children: <>Link text</>,
  element: { url: "https://www.alulearn.com" },
};
