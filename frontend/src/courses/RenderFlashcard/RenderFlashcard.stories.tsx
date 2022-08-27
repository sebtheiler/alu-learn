import RenderFlashcard from ".";
import type { FlashcardType } from "@/types";
import { ComponentStory } from "@storybook/react";

const flashcard = {
  id: "cl7bxrozp1243sxi0io3oirm6",
  fields: {
    value: [
      [
        {
          type: "paragraph",
          children: [
            {
              text: "Lots of ",
            },
            {
              bold: true,
              text: "fancy",
            },
            {
              text: " formatting",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text: "",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text: "!!",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              text: "Yay!",
            },
          ],
        },
      ],
      [
        {
          type: "math-block",
          children: [
            {
              text: "\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
            },
          ],
        },
      ],
    ],
  },
  tags: "",
  subSectionId: "cl7anemos007518i0llge5qs6",
  type: "NORMAL" as FlashcardType,
};

export default {
  title: "Courses/RenderFlashcard",
  component: RenderFlashcard,
};

const Template: ComponentStory<typeof RenderFlashcard> = (args) => (
  <RenderFlashcard {...args} />
);

export const RenderFlashcardExample = Template.bind({});
RenderFlashcardExample.args = {
  flashcard: flashcard,
};
