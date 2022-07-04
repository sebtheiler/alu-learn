import { ExtendedSlateElement } from '../../types';

interface LinkComponentProps {
  /**
   * Attributes passed to the `<a>` element
   */
  attributes: any;
  /**
   * Children of the `<a>` element
   */
  children: JSX.Element[] | JSX.Element;
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
    <OverlayTrigger
      overlay={
        <Tooltip className='button-tooltip text-center' id='link-tooltip'>
          <a href={element.url} style={{ color: 'white' }} target='_blank' rel='noreferrer'>
            {element.url.length > 50
              ? element.url.substring(0, 15) + '   ...   ' + element.url.substring(element.url.length - 10, element.url.length)
              : element.url
            }
          </a>
        </Tooltip>
      }
      placement='top'
      delay={{ show: 20, hide: 550 }}
    >
      <a {...attributes} className='underline text-blue-600 hover:text-blue-800' href={element.url} target='_blank' rel='noreferrer'>
        {children}
      </a>
    </OverlayTrigger>
  );
}
