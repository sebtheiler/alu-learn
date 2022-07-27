import NotFoundPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/NotFoundPage",
  component: NotFoundPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof NotFoundPage> = (args) => (
  <NotFoundPage />
);

export const NotFoundPageExample = Template.bind({});
NotFoundPageExample.parameters = {
  layout: "fullscreen",
};
