import ExploreDecksPage from ".";
import { ComponentStory } from "@storybook/react";
import withNavbar from "helpers/withNavbar";
import withFullContext from "helpers/withFullContext";

export default {
  title: "Pages/ExploreDecksPage",
  component: ExploreDecksPage,
  decorators: [withNavbar, withFullContext],
};

const Template: ComponentStory<typeof ExploreDecksPage> = (args) => <ExploreDecksPage />;

export const ExploreDecksPageExample = Template.bind({});
ExploreDecksPageExample.parameters = {
  layout: "fullscreen",
}