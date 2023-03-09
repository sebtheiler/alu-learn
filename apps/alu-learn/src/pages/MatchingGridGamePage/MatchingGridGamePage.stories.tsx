import MatchingGridGamePage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/MatchingGridGamePage",
  component: MatchingGridGamePage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof MatchingGridGamePage> = (args) => (
  <MatchingGridGamePage {...args} />
);

export const MatchingGridGamePageExample = Template.bind({});
MatchingGridGamePageExample.parameters = {
  layout: "fullscreen",
};
