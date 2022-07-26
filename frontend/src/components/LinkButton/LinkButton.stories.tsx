import withFullContext from '@helpers/withFullContext';
import { ComponentStory } from '@storybook/react';

import LinkButton from '.';

export default {
  title: 'Components/LinkButton',
  component: LinkButton,
  decorators: [withFullContext],
}

const Template: ComponentStory<typeof LinkButton> = (args) => <LinkButton {...args}>Hello World</LinkButton>;

export const LinkButtonExample = Template.bind({});
LinkButtonExample.args = {
  variant: 'primary',
  href: '/home',
  pill: true,
  block: false,
}
