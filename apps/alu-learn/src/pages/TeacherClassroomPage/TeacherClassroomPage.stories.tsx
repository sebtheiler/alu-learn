import TeacherClassroomPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/ClassesPage",
  component: TeacherClassroomPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof TeacherClassroomPage> = (args) => (
  <TeacherClassroomPage {...args} />
);

export const ClassesPageExample = Template.bind({});
ClassesPageExample.parameters = {
  layout: "fullscreen",
};
