import Modal from ".";
import { ComponentStory } from "@storybook/react";
import Button from "atoms/Button";
import { useState } from "react";

export default {
  title: "Atoms/Modal",
  component: Modal,
};

const Template: ComponentStory<typeof Modal> = (args) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} close={() => setOpen(false)} {...args} />
    </>
  );
};

export const Example = Template.bind({});
Example.args = {
  children: <>Example text</>,
  title: "Example Modal",
  buttons: <Button block>Example button</Button>,
  maxWidth: "xl",
};
