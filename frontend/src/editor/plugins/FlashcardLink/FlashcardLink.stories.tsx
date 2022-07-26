import { ComponentStory } from "@storybook/react";

import { FlashCardLinkComponent } from ".";

export default {
  title: "editor/plugins/FlashCardLinkComponent",
  component: FlashCardLinkComponent,
};

const Template: ComponentStory<typeof FlashCardLinkComponent> = (args) => (
  <FlashCardLinkComponent {...args} />
);

export const ExampleFlashCardLink = Template.bind({});
ExampleFlashCardLink.args = {
  attributes: {},
  children: <>Flashcard link text</>,
  element: { flashcardUUID: "" },
};
