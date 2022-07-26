import blankSlateElement from '@helpers/blankSlateElement';
import { ComponentStory } from '@storybook/react';
import { ReactEditor } from 'slate-react';
import { createFullEditor } from '../FullEditable';
import { useMemo, useState } from 'react';

import RenderEditor from '.';

export default {
  title: 'editor/RenderEditor',
  component: RenderEditor,
}

const Template: ComponentStory<typeof RenderEditor> = (args) => {
  const editor = useMemo<ReactEditor>(createFullEditor, []);
  const [value, setValue] = useState(blankSlateElement);

  return (
    <RenderEditor
      editor={editor}
      value={value}
      setValue={setValue}
      {...args}
    />
  );
}

export const RenderEditorExample = Template.bind({});
RenderEditorExample.args = {
  displayFlashCardLinkButton: true,
  isPro: true,
  readOnly: false,
};

