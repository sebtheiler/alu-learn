import withFullContext from '@helpers/withFullContext';
import withNavbar from '@helpers/withNavbar';
import { ComponentStory } from '@storybook/react';

import NotFoundPage from '.';

export default {
  title: 'Pages/NotFoundPage',
  component: NotFoundPage,
  decorators: [withNavbar, withFullContext]
}

const Template: ComponentStory<typeof NotFoundPage> = () => <NotFoundPage />;

export const NotFoundPageExample = Template.bind({});