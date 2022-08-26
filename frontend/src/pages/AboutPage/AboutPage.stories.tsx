import AboutPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/AboutPage",
  component: AboutPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof AboutPage> = () => <AboutPage />;

export const AboutPageExample = Template.bind({});
AboutPageExample.parameters = {
  layout: "fullscreen",
};
