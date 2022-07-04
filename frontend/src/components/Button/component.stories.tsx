import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { ComponentStory } from '@storybook/react';

import Button from '.';

export default {
  title: 'Components/Button',
  component: Button,
}

const Template: ComponentStory<typeof Button> = (args) => <Button {...args}>Hello World</Button>;

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  pill: true,
  block: false,
};

export const Gradient = Template.bind({});
Gradient.args = {
  variant: 'gradient',
  pill: true,
  block: false,
};

export const PrimaryOutline = Template.bind({});
PrimaryOutline.args = {
  variant: 'primary-outline',
  pill: true,
  block: false,
};

export const NonPill = Template.bind({});
NonPill.args = {
  variant: 'primary',
  pill: false,
  block: false,
};

export const Block = Template.bind({});
Block.args = {
  variant: 'primary',
  pill: false,
  block: true,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  variant: 'primary',
  pill: true,
  block: false,
  faIcon: faPlus,
};
