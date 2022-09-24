import BlockButton from ".";
import { createFullEditor } from "../../FullEditable";
import { faSquareRootAlt } from "@fortawesome/free-solid-svg-icons";
import { ComponentStory } from "@storybook/react";
import { useMemo } from "react";
import { ReactEditor } from "slate-react";

export default {
  title: "editor/EditorButtons/BlockButton",
  component: BlockButton,
};

const Template: ComponentStory<typeof BlockButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return <BlockButton {...args} editor={editor} />;
};

export const MathButton = Template.bind({});
MathButton.args = {
  format: "math-block",
  faIcon: faSquareRootAlt,
  tabbable: true,
};
