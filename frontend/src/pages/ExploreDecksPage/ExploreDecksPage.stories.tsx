import withFullContext from "helpers/withFullContext";
import withNavbar from "helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

import ExploreDecksPage from ".";

export default {
  title: "Pages/ExploreDecksPage",
  component: ExploreDecksPage,
  layout: "fullscreen",
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ExploreDecksPage> = () => (
  <ExploreDecksPage />
);

export const ExploreDecksPageExample = Template.bind({});
