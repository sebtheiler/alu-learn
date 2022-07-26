import { ComponentStory } from "@storybook/react";
import { ReactEditor } from "slate-react";
import { createFullEditor } from "editor/FullEditable";
import { useMemo } from "react";

import { LinkButton } from ".";

export default {
  title: "editor/plugins/LinkButton",
  component: LinkButton,
};

const Template: ComponentStory<typeof LinkButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return <LinkButton editor={editor} {...args} />;
};

export const LinkButtonExample = Template.bind({});
LinkButtonExample.args = {
  tabbable: true,
};
