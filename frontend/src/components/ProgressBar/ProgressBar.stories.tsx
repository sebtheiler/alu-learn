import { ComponentStory } from '@storybook/react';

import ProgressBar from '.';

export default {
  title: 'Components/ProgressBar',
  component: ProgressBar,
}

const Template: ComponentStory<typeof ProgressBar> = (args) => <ProgressBar {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  stepNum: 0,
  totalNumSteps: 10,
};

export const Halfway = Template.bind({});
Halfway.args = {
  stepNum: 5,
  totalNumSteps: 10,
};

export const Full = Template.bind({});
Full.args = {
  stepNum: 10,
  totalNumSteps: 10,
};