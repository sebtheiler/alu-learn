import Ad from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Components/Ad",
  component: Ad,
};

const Template: ComponentStory<typeof Ad> = (args) => <Ad {...args} />;

export const AdExample = Template.bind({});
AdExample.args = {};
