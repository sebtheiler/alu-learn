import EditorButtons from ".";
import { createFullEditor } from "../FullEditable";
import { ComponentStory } from "@storybook/react";
import { useMemo } from "react";
import { ReactEditor } from "slate-react";

export default {
  title: "editor/EditorButtons",
  component: EditorButtons,
};

const Template: ComponentStory<typeof EditorButtons> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return <EditorButtons {...args} editor={editor} />;
};

export const EditorButtonsExample = Template.bind({});
EditorButtonsExample.args = {
  className: "ml-5 mt-5",
  tabbable: true,
  displayFlashcardLinkButton: true,
  displayHeadingButton: false,
  isPro: true,
};
