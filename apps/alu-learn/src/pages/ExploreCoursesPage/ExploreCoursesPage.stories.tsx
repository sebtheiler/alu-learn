import ExploreCoursesPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "Pages/ExploreDecksPage",
  component: ExploreCoursesPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof ExploreCoursesPage> = (args) => (
  <ExploreCoursesPage {...args} />
);

export const ExploreDecksPageExample = Template.bind({});
ExploreDecksPageExample.parameters = {
  layout: "fullscreen",
};
