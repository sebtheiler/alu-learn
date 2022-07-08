import withFullContext from '@helpers/withFullContext';
import withNavbar from '@helpers/withNavbar';
import { ComponentStory } from '@storybook/react';

import ProPurchaseSuccessPage from '.';

export default {
  title: 'Pages/ProPurchaseSuccessPage',
  component: ProPurchaseSuccessPage,
  layout: 'fullscreen',
  decorators: [withNavbar, withFullContext],
}

const Template: ComponentStory<typeof ProPurchaseSuccessPage> = () => <ProPurchaseSuccessPage />;
export const ProPurchaseSuccessExample = Template.bind({});