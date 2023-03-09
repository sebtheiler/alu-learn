import AlgorithmResearchPage from ".";
import withNavbar from "@/helpers/withNavbar";
import { ComponentStory } from "@storybook/react";

export default {
  title: "pages/AlgorithmResearchPage",
  component: AlgorithmResearchPage,
  decorators: [withNavbar],
};

const Template: ComponentStory<typeof AlgorithmResearchPage> = (args) => (
  <AlgorithmResearchPage {...args} />
);

export const AlgorithmResearchPageExample = Template.bind({});
AlgorithmResearchPageExample.parameters = {
  layout: "fullscreen",
};
