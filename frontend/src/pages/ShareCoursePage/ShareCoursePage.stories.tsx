import ShareCoursePage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/ShareCoursePage",
  component: ShareCoursePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ShareCoursePage> = (args) => (
  <ShareCoursePage {...args} />
);

export const ShareCoursePageExample = Template.bind({});
ShareCoursePageExample.parameters = {
  layout: "fullscreen",
};
