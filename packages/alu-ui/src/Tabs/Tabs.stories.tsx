import Tabs from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/Tabs",
  component: Tabs,
};

const Template: ComponentStory<typeof Tabs> = (args) => <Tabs {...args} />;

export const TabsExample = Template.bind({});
TabsExample.args = {};
