import NotFoundPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/NotFoundPage",
  component: NotFoundPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof NotFoundPage> = () => <NotFoundPage />;

export const NotFoundPageExample = Template.bind({});
NotFoundPageExample.parameters = {
  layout: "fullscreen",
};
