import FlashcardList from ".";
import { FlashcardType } from "@/types";
import { ComponentStory } from "@storybook/react";

const flashcards = [
  {
    id: "cl7phfdxv2281soivdzdotzi9",
    fields:
      '[{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"flashcard #1","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}},{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"back #1","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}]',
    tags: "",
    subSectionId: "cl7dtmpl50116l6ivmr0bz30s",
    type: "NORMAL" as FlashcardType,
    courseId: "cl7dtmpku0096l6iv870i9u8r",
  },
  {
    id: "cl7phfit02319soive8tlsrg4",
    fields:
      '[{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"flashcard #2","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}},{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"back #2","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}]',
    tags: "",
    subSectionId: "cl7dtmpl50116l6ivmr0bz30s",
    type: "NORMAL" as FlashcardType,
    courseId: "cl7dtmpku0096l6iv870i9u8r",
  },
  {
    id: "cl7phfltd2358soivo9iflrb0",
    fields:
      '[{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"flashcard #3","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}},{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"back #3","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}]',
    tags: "",
    subSectionId: "cl7dtmpl50116l6ivmr0bz30s",
    type: "NORMAL" as FlashcardType,
    courseId: "cl7dtmpku0096l6iv870i9u8r",
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
