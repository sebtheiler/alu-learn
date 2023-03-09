import SearchFlashcardsPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/SearchFlashcardsPage",
  component: SearchFlashcardsPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof SearchFlashcardsPage> = (args) => (
  <SearchFlashcardsPage {...args} />
);

export const SearchFlashcardsPageExample = Template.bind({});
SearchFlashcardsPageExample.parameters = {
  layout: "fullscreen",
};
