import FlashcardList from ".";
import { FlashcardType } from "@/types";
import { ComponentStory } from "@storybook/react";

const flashcards = [
  {
    id: "cl7cg9zfp0410xli0y1j21ojg",
    fields: {
      value: [
        [
          {
            type: "paragraph",
            children: [
              {
                text: "Test",
              },
            ],
          },
        ],
        [
          {
            type: "paragraph",
            children: [
              {
                text: "flashcard",
              },
            ],
          },
        ],
      ],
    },
    tags: "",
    subSectionId: "cl7c4lw0z2814sxi0tgarj1w2",
    type: "NORMAL" as FlashcardType,
    courseId: "cl7c4lw0s2794sxi0z8f0afsd",
  },
  {
    id: "cl7cga26g0449xli0dhqnxui1",
    fields: {
      value: [
        [
          {
            type: "paragraph",
            children: [
              {
                text: "Another",
              },
            ],
          },
        ],
        [
          {
            type: "paragraph",
            children: [
              {
                text: "test",
              },
            ],
          },
        ],
      ],
    },
    tags: "",
    subSectionId: "cl7c4lw0z2814sxi0tgarj1w2",
    type: "NORMAL" as FlashcardType,
    courseId: "cl7c4lw0s2794sxi0z8f0afsd",
  },
];

export default {
  title: "Courses/FlashcardList",
  component: FlashcardList,
};

const Template: ComponentStory<typeof FlashcardList> = (args) => (
  <FlashcardList {...args} />
);

export const FlashcardListExample = Template.bind({});
FlashcardListExample.args = {
  flashcards: flashcards,
};
