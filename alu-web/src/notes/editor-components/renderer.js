import React from 'react';
import {LinkElement} from './links';
import {ImageElement} from './images';

export const Element = (props) => {
  // TODO: `readOnly` is unused for now, but will be used in equation editing
  // eslint-disable-next-line
  const { attributes, children, element, readOnly } = props;

  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes}>{children}</blockquote>
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>
    case 'list-item':
      return <li {...attributes}>{children}</li>
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>
    case 'link':
      return <LinkElement {...props} />
    case 'image':
      return <ImageElement {...props} />
    default:
      return <p {...attributes}>{children}</p>
  };
};

// TODO: `readOnly` is unused for now, but will be used in equation editing
// eslint-disable-next-line
export const Leaf = ({ attributes, children, leaf, readOnly }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  };

  if (leaf.code) {
    children = <code>{children}</code>
  };

  if (leaf.italic) {
    children = <em>{children}</em>
  };

  if (leaf.underline) {
    children = <u>{children}</u>
  };

  if (leaf.strikethrough) {
    children = <del>{children}</del>
  };

  return <span {...attributes}>{children}</span>
};