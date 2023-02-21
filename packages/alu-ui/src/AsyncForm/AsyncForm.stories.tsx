import AsyncForm from ".";
import TextInput from "../TextInput";
import { ComponentStory } from "@storybook/react";

export default {
  title: "AsyncForm",
  component: AsyncForm,
};

const Template: ComponentStory<typeof AsyncForm> = (args) => (
  <AsyncForm {...args}>
    <TextInput label="Input" name="myInput" required />
  </AsyncForm>
);

export const AsyncFormExample = Template.bind({});
AsyncFormExample.args = {
  onSubmit: async (e) => {
    const target = e.target as HTMLFormElement;
    // @ts-ignore
    console.log(target.elements.myInput.value);
    await new Promise((r) => setTimeout(r, 2000));
  },
  buttonProps: {
    children: <>Submit Form</>,
    className: "mt-1",
  },
};
