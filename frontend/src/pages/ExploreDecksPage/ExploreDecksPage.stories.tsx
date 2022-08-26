import ExploreDecksPage from ".";
import withFullContext from "@/helpers/withFullContext";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

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
