import { ComponentStory } from '@storybook/react';
import { ReactEditor } from 'slate-react';
import { createFullEditor } from '../../FullEditable';
import { faBold } from '@fortawesome/free-solid-svg-icons'
import { useMemo } from 'react';

import MarkButton from '.';

export default {
  title: 'editor/EditorButtons/MarkButton',
  component: MarkButton,
}

const Template: ComponentStory<typeof MarkButton> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);

  return (
    <MarkButton
      editor={editor}
      {...args}
    />
  );
}

export const BoldButton = Template.bind({});
BoldButton.args = {
  format: 'bold',
  faIcon: faBold,
  tabbable: true,
};
