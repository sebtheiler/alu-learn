import { ComponentStory } from '@storybook/react';
import { faTrash } from '@fortawesome/free-solid-svg-icons'

import IconTooltip from '.';

export default {
  title: 'Components/IconTooltip',
  component: IconTooltip,
}

const Template: ComponentStory<typeof IconTooltip> = (args) => <IconTooltip {...args} />;

export const TrashIcon = Template.bind({});
TrashIcon.args = {
  tooltip: 'Delete',
  onClick: async (e) => {
    console.log('Deleting...');
    await new Promise(r => setTimeout(r, 2000));
  },
  faIcon: faTrash,
  id: 'delete-icon',
  className: 'mt-5'
};
