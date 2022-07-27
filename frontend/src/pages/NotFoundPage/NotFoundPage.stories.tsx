import NotFoundPage from ".";
import { ComponentStory } from "@storybook/react";
import withNavbar from "helpers/withNavbar";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Pages/NotFoundPage",
  component: NotFoundPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof NotFoundPage> = (args) => <NotFoundPage />;

export const NotFoundPageExample = Template.bind({});
NotFoundPageExample.parameters = {
  layout: "fullscreen",
}