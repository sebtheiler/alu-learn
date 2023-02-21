import Modal from ".";
import Button from "../Button";
import { ComponentStory } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Modal",
  component: Modal,
};

const Template: ComponentStory<typeof Modal> = (args) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal {...args} open={open} close={() => setOpen(false)} />
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
