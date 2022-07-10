import withFullContext from '@helpers/withFullContext';
import withNavbar from '@helpers/withNavbar';
import { ComponentStory } from '@storybook/react';

import WelcomeSurveyPage from '.';

export default {
  title: 'Pages/WelcomeSurveyPage',
  component: WelcomeSurveyPage,
  decorators: [withNavbar, withFullContext],
}

const Template: ComponentStory<typeof WelcomeSurveyPage> = () => <WelcomeSurveyPage />;

export const WelcomeSurveyPageExample = Template.bind({});