import { createFullEditor } from ".";
import FullEditable from ".";
import blankSlateElement from "@/helpers/blankSlateElement";
import { ComponentStory } from "@storybook/react";
import { useMemo, useState } from "react";
import { ReactEditor, Slate } from "slate-react";

export default {
  title: "editor/FullEditable",
  component: FullEditable,
};

const Template: ComponentStory<typeof FullEditable> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);
  const [value, setValue] = useState(blankSlateElement);

  return (
    <Slate
      editor={editor}
      value={value}
      // @ts-ignore
      onChange={(newValue) => setValue(newValue)}
    >
      <FullEditable {...args} editor={editor} />
    </Slate>
  );
};

export const FullEditableExample = Template.bind({});
FullEditableExample.args = {
  readOnly: false,
  className: "mt-3 p-3 border rounded",
  id: "full-editable",
};
