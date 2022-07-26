import { ComponentStory } from "@storybook/react";
import { ReactEditor } from "slate-react";
import { createFullEditor } from "../../FullEditable";
import { faSquareRootAlt } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";

import BlockButton from ".";

export default {
  title: "editor/EditorButtons/BlockButton",
  component: BlockButton,
};

const Template: ComponentStory<typeof BlockButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return <BlockButton editor={editor} {...args} />;
};

export const MathButton = Template.bind({});
MathButton.args = {
  format: "math-block",
  faIcon: faSquareRootAlt,
  tabbable: true,
};
