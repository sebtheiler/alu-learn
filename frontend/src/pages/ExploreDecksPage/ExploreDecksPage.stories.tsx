import ExploreDecksPage from ".";
import { ComponentStory } from "@storybook/react";
import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";

export default {
  title: "Pages/ExploreDecksPage",
  component: ExploreDecksPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ExploreDecksPage> = () => (
  <ExploreDecksPage />
);

export const ExploreDecksPageExample = Template.bind({});
ExploreDecksPageExample.parameters = {
  layout: "fullscreen",
};
