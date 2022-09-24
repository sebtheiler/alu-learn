import MarkButton from ".";
import { createFullEditor } from "../../FullEditable";
import { faBold } from "@fortawesome/free-solid-svg-icons";
import { ComponentStory } from "@storybook/react";
import { useMemo } from "react";
import { ReactEditor } from "slate-react";

export default {
  title: "editor/EditorButtons/MarkButton",
  component: MarkButton,
};

const Template: ComponentStory<typeof MarkButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return <MarkButton {...args} editor={editor} />;
};

export const BoldButton = Template.bind({});
BoldButton.args = {
  format: "bold",
  faIcon: faBold,
  tabbable: true,
};
