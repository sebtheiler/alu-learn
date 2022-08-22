import HomePage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

const courses = [
  {
    id: "cl716cjud0174i2i0sv5xsd5p",
    title: "test",
  },
  {
    id: "cl71bjo710258w0i02oyrdrdq",
    title: "test4",
  },
  {
    id: "cl70v69j20011i2i06jqlvcya",
    title: "test",
  },
  {
    id: "cl716eg7x0194i2i09e1xuecf",
    title: "test2",
  },
];

export default {
  title: "pages/HomePage",
  component: HomePage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof HomePage> = (args) => (
  <HomePage {...args} />
);

export const HomePageExample = Template.bind({});
HomePageExample.args = {
  courses: courses,
};
HomePageExample.parameters = {
  layout: "fullscreen",
};
