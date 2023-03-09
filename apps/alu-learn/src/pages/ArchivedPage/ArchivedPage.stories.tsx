import ArchivedPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/ArchivedPage",
  component: ArchivedPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof ArchivedPage> = (args) => (
  <ArchivedPage {...args} />
);

export const ArchivedPageExample = Template.bind({});
ArchivedPageExample.parameters = {
  layout: "fullscreen",
};
