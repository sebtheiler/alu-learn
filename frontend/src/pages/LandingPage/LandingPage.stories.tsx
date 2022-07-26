import withFullContext from '@helpers/withFullContext';
import withNavbar from '@helpers/withNavbar';
import { ComponentStory } from '@storybook/react';

import LandingPage from '.';

export default {
  title: 'Pages/LandingPage',
  component: LandingPage,
  layout: 'fullscreen',
  decorators: [withNavbar, withFullContext],
}


const Template: ComponentStory<typeof LandingPage> = () => <LandingPage />;


export const LandingPageExample = Template.bind({});
LandingPageExample.parameters = {
  layout: 'fullscreen',
}