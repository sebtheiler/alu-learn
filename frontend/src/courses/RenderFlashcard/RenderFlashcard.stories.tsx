import RenderFlashcard from ".";
import withFullContext from "@/helpers/withFullContext";
import type { FlashcardType } from "@/types";
import { ComponentStory } from "@storybook/react";

const flashcard = {
  id: "cl7pfrz030707soivgpz4z5tt",
  fields:
    '[{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"front","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}},{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"back","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}]',
  tags: "",
  subSectionId: "cl7dtmpl50116l6ivmr0bz30s",
  type: "NORMAL" as FlashcardType,
  courseId: "cl7dtmpku0096l6iv870i9u8r",
};

export default {
  title: "Courses/RenderFlashcard",
  component: RenderFlashcard,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof RenderFlashcard> = (args) => (
  <RenderFlashcard {...args} />
);

export const RenderFlashcardExample = Template.bind({});
RenderFlashcardExample.args = {
  flashcard: flashcard,
};

export const Hidden = Template.bind({});
Hidden.args = {
  flashcard: flashcard,
  hidden: true,
};
