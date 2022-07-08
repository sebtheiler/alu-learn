import { ComponentStory } from '@storybook/react';

import DisplayProfileInline from '.';

export default {
  title: 'Components/DisplayProfileInline',
  component: DisplayProfileInline,
}

const Template: ComponentStory<typeof DisplayProfileInline> = (args) => <DisplayProfileInline {...args} />;

export const ExampleUser = Template.bind({});
ExampleUser.args = {
  profile: {
    firstName: 'Example',
    lastName: 'User',
    username: 'exampleuser',
  }
};