import { FlashcardLinkButton } from ".";
import { createFullEditor } from "@/editor/FullEditable";
import withFullContext from "@/helpers/withFullContext";
import { ComponentStory } from "@storybook/react";
import { useMemo } from "react";
import { ReactEditor } from "slate-react";

export default {
  title: "editor/plugins/FlashcardLinkButton",
  component: FlashcardLinkButton,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof FlashcardLinkButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return <FlashcardLinkButton {...args} editor={editor} />;
};

export const FlashcardLinkButtonExample = Template.bind({});
FlashcardLinkButtonExample.args = {
  tabbable: true,
  isPro: true,
};
