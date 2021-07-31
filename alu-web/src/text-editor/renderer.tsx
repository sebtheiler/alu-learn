import React from 'react';
import { LinkElement } from './links';
import { ImageElement } from './images';
import { BlockMath, InlineMath } from 'react-katex';
import { Node } from 'slate';
import './renderer.css';

export const Element = (props) => {
  const { attributes, children, element, readOnly } = props;

  switch (element.type) {
    case 'bulleted-list':
      return <ul {...attributes} style={{ listStylePosition: 'inside' }}>{children}</ul>
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
      return <ol {...attributes} style={{ listStylePosition: 'inside' }}>{children}</ol>
    case 'link':
      return <LinkElement {...props} />
    case 'image':
      return <ImageElement {...props} />
    case 'math-block':
      if (readOnly)
        return <BlockMath {...attributes}>{Node.string(props.element)}</BlockMath>
      return <p className='math-block' {...attributes}>{children}</p>
    default:
      return <p {...attributes}>{children}</p>
  }
}

export const Leaf = ({ attributes, children, leaf, readOnly }) => {
  if (leaf.bold)
    children = <strong>{children}</strong>

  if (leaf.code)
    children = <code>{children}</code>

  if (leaf.italic)
    children = <em>{children}</em>

  if (leaf.underline)
    children = <u>{children}</u>

  if (leaf.math_inline) {
    if (readOnly) {
      // I'm sure there's some way like Node.string(...) to avoid this parse error
      // and allow for rich text ignoring, but I can't find it at the moment
      const text = children?.props?.text?.text;
      if (!text) {
        children = <strong>KaTeX Parse Error: Please make sure the equation has no rich text formatting in it</strong>
      } else {
        children = <InlineMath>{text}</InlineMath>
      }
    } else {
      children = <span className='math-inline'>{children}</span>
    }
  }

  return <span {...attributes}>{children}</span>
}