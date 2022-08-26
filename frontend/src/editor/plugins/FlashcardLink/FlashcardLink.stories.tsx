import { FlashcardLinkComponent } from ".";
import { ComponentStory } from "@storybook/react";

export default {
  title: "editor/plugins/FlashcardLinkComponent",
  component: FlashcardLinkComponent,
};

const Template: ComponentStory<typeof FlashcardLinkComponent> = (args) => (
  <FlashcardLinkComponent {...args} />
);

export const ExampleFlashcardLink = Template.bind({});
ExampleFlashcardLink.args = {
  attributes: {},
  children: <>Flashcard link text</>,
};
