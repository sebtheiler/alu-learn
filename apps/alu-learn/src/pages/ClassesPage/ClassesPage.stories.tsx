import ClassesPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/ClassesPage",
  component: ClassesPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof ClassesPage> = (args) => (
  <ClassesPage {...args} />
);

export const ClassesPageExample = Template.bind({});
ClassesPageExample.parameters = {
  layout: "fullscreen",
};
