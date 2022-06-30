import TeX from '@components/TeX';
import { FlashCardLinkComponent } from "@slate-plugins/FlashcardLink/component";
import { LinkComponent } from "@slate-plugins/Link";
import { Node } from 'slate';

const Element = (props) => {
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
      return <LinkComponent {...props} />
    case 'flashcard-link':
      return <FlashCardLinkComponent {...props} />
    case 'image':
      return <p>
        The image choice is now deprecated.
        Please change <a target='_blank' rel='noreferrer' href={element.url}>{element.url.slice(0, 50)}</a> to use the new image uploading system.
      </p>
    case 'math-block':
      if (readOnly)
        return <TeX math={Node.string(props.element)} block />
      return <p className='math-block' {...attributes}>{children}</p>
    default:
      return <p {...attributes} className='mb-0'>{children}</p>
  }
}

export default Element;