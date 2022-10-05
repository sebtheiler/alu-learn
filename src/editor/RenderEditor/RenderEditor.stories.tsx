import RenderEditor from ".";
import { createFullEditor } from "../FullEditable";
import blankSlateElement from "@/helpers/blankSlateElement";
import withFullContext from "@/helpers/withFullContext";
import { ComponentStory } from "@storybook/react";
import { useMemo, useState } from "react";
import { ReactEditor } from "slate-react";

export default {
  title: "editor/RenderEditor",
  component: RenderEditor,
  decorators: [withFullContext],
};

const Template: ComponentStory<typeof RenderEditor> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);
  const [value, setValue] = useState(blankSlateElement);

  return (
    <RenderEditor {...args} editor={editor} value={value} setValue={setValue} />
  );
};

export const RenderEditorExample = Template.bind({});
RenderEditorExample.args = {
  displayFlashcardLinkButton: true,
  isPro: true,
  readOnly: false,
};
