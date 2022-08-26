import { FlashCardLinkButton } from ".";
import { createFullEditor } from "@/editor/FullEditable";
import withFullContext from "@/helpers/withFullContext";
import { ComponentStory } from "@storybook/react";
import { useMemo } from "react";
import { ReactEditor } from "slate-react";

export default {
  title: "editor/plugins/FlashcardLinkButton",
  component: FlashCardLinkButton,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof FlashCardLinkButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return <FlashCardLinkButton editor={editor} {...args} />;
};

export const FlashCardLinkButtonExample = Template.bind({});
FlashCardLinkButtonExample.args = {
  tabbable: true,
  isPro: true,
};
