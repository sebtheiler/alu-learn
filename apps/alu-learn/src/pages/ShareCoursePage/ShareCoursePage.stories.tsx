import ShareCoursePage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/ShareCoursePage",
  component: ShareCoursePage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof ShareCoursePage> = (args) => (
  <ShareCoursePage {...args} />
);

export const ShareCoursePageExample = Template.bind({});
ShareCoursePageExample.parameters = {
  layout: "fullscreen",
};
