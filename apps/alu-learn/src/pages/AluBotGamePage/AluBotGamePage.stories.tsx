import AluBotGamePage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/AluBotGamePage",
  component: AluBotGamePage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof AluBotGamePage> = (args) => (
  <AluBotGamePage {...args} />
);

export const AluBotGamePageExample = Template.bind({});
AluBotGamePageExample.parameters = {
  layout: "fullscreen",
};
