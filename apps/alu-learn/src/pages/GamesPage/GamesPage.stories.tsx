import GamesPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/GamesPage",
  component: GamesPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof GamesPage> = () => <GamesPage />;

export const GamesPageExample = Template.bind({});
GamesPageExample.parameters = {
  layout: "fullscreen",
};
