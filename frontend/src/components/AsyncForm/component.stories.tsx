import TextInput from '@components/Form/TextInput';
import { ComponentStory } from '@storybook/react';

import AsyncForm from '.';

export default {
  title: 'Components/AsyncForm',
  component: AsyncForm,
}

const Template: ComponentStory<typeof AsyncForm> = (args) => <AsyncForm {...args}>
  <TextInput label='Input' name='myInput' required />
</AsyncForm>;

export const AsyncFormExample = Template.bind({});
AsyncFormExample.args = {
  onSubmit: async (e) => {
    console.log(e.target.elements.myInput.value);
    await new Promise(r => setTimeout(r, 2000));
  },
  buttonProps: {
    children: <>Submit Form</>,
    className: 'mt-1',
  },
};