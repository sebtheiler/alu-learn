import Tooltip from 'components/Tooltip';

import type { ExtendedSlateElement } from '../../types';

interface LinkComponentProps {
  /**
   * Attributes passed to the `<a>` element
   */
  attributes: any;
  /**
   * Children of the `<a>` element
   */
  children: React.ReactNode;
  /**
   * SlateJS Element to render
   */
  element: ExtendedSlateElement;
}

/**
 * Render a link component in the SlateJS editor
 */
export default function LinkComponent({
  attributes,
  children,
  element,
}: LinkComponentProps) {
  return (
    <Tooltip tooltip={
      <a href={element.url} style={{ color: 'white' }} target='_blank' rel='noreferrer'>
        {element.url.length > 50
          ? element.url.substring(0, 15) + '   ...   ' + element.url.substring(element.url.length - 10, element.url.length)
          : element.url
        }
      </a>
    } className='underline text-blue-300'>
      <a {...attributes} className='underline text-blue-600 hover:text-blue-800' href={element.url} target='_blank' rel='noreferrer'>
        {children}
      </a>
    </Tooltip>
  );
}
