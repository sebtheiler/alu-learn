import { ComponentStory } from '@storybook/react';
import { ReactEditor } from 'slate-react';
import { createFullEditor } from 'editor/FullEditable';
import { useMemo } from 'react';

import { FlashCardLinkButton } from '.';

export default {
  title: 'editor/plugins/FlashCardLinkButton',
  component: FlashCardLinkButton,
}

const Template: ComponentStory<typeof FlashCardLinkButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return (
    <FlashCardLinkButton
      editor={editor}
      {...args}
    />
  );
}

export const FlashCardLinkButtonExample = Template.bind({});
FlashCardLinkButtonExample.args = {
  tabbable: true,
  isPro: true,
};
