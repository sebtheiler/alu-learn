import RenderEditor from ".";
import { createFullEditor } from "../FullEditable";
import { ComponentStory } from "@storybook/react";
import blankSlateElement from "helpers/blankSlateElement";
import { useMemo, useState } from "react";
import { ReactEditor } from "slate-react";

export default {
  title: "editor/RenderEditor",
  component: RenderEditor,
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
  displayFlashCardLinkButton: true,
  isPro: true,
  readOnly: false,
};
