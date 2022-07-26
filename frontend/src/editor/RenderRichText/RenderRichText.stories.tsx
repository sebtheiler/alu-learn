import { ComponentStory } from '@storybook/react';

import RenderRichText from '.';

export default {
  title: 'editor/RenderRichText',
  component: RenderRichText,
}

const Template: ComponentStory<typeof RenderRichText> = (args) => <RenderRichText {...args} />;

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered math equation in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'math-block',
    children: [{ text: 'a^2 + b^2 = c^2' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

export const ExampleText = Template.bind({});
ExampleText.args = {
  text: initialValue,
  fixSlateLazy: true,
};
