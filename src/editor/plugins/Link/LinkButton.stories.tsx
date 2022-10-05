import { LinkButton } from ".";
import { createFullEditor } from "@/editor/FullEditable";
import { ComponentStory } from "@storybook/react";
import { useMemo } from "react";
import { ReactEditor } from "slate-react";

export default {
  title: "editor/plugins/LinkButton",
  component: LinkButton,
};

const Template: ComponentStory<typeof LinkButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return <LinkButton {...args} editor={editor} />;
};

export const LinkButtonExample = Template.bind({});
LinkButtonExample.args = {
  tabbable: true,
};
