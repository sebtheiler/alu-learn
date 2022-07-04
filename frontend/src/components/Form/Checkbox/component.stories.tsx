import { ComponentStory } from '@storybook/react';

import Checkbox from '.';

export default {
  title: 'Components/Form/Checkbox',
  component: Checkbox,
}

const Template: ComponentStory<typeof Checkbox> = (args) => <Checkbox {...args} />;

export const CheckboxExample = Template.bind({});
CheckboxExample.args = {
  label: 'My Checkbox',
  description: 'a very very long description',
  id: 'my-checkbox',
}