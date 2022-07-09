import { ComponentStory } from '@storybook/react';

import NotFoundPage from '.';

export default {
  title: 'Pages/NotFoundPage',
  component: NotFoundPage,
}

const Template: ComponentStory<typeof NotFoundPage> = () => <NotFoundPage />;

export const NotFoundPageExample = Template.bind({});