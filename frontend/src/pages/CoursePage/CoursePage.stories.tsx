import CoursePage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "pages/CoursePage",
  component: CoursePage,
  decorators: [withNavbar, withFullContext],
};

const course = {
  id: "cl716cjud0174i2i0sv5xsd5p",
  title: "test",
  bannerImage: null,
  courseSections: [
    {
      id: "cl74urv9300087ai0udubgndr",
      title: "Hello",
      subSections: [
        {
          id: "cl74xd4kj0025i8i0ewibo9ci",
          title: "My Subsection",
        },
        {
          id: "cl74z7enn0515i8i0naqyd7hd",
          title: "Another Subsection",
        },
        {
          id: "cl74z84e60560i8i0mgyr8d7a",
          title: "Whatever",
        },
      ],
    },
    {
      id: "cl74utdoo00397ai0rgmz0t9u",
      title: "Hello1",
      subSections: [
        {
          id: "cl754p3jy1205yzi0hpk37uvu",
          title: "Hello1 Test",
        },
      ],
    },
  ],
};

const Template: ComponentStory<typeof CoursePage> = (args) => (
  <CoursePage {...args} />
);

export const AuthorizedCoursePage = Template.bind({});
AuthorizedCoursePage.args = {
  authorized: true,
  course: course,
};
AuthorizedCoursePage.parameters = {
  layout: "fullscreen",
};

export const UnauthorizedCoursePage = Template.bind({});
UnauthorizedCoursePage.args = {
  authorized: false,
};
UnauthorizedCoursePage.parameters = {
  layout: "fullscreen",
};
