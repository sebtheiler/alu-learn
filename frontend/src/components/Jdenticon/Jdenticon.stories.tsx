import { ComponentStory } from '@storybook/react';

import Jdenticon from '.';

export default {
  title: 'Components/Jdenticon',
  component: Jdenticon,
}

const Template: ComponentStory<typeof Jdenticon> = (args) => <Jdenticon {...args} />;

export const Example = Template.bind({});
Example.args = {
  value: 'whatever',
  size: 400,
};
