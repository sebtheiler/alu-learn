import OverlayTrigger from '../OverlayTrigger';
import Spinner from '../Spinner';
import Tooltip from '../Tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { MouseEventHandler, useState } from 'react';

interface IconTooltipProps {
  /**
   * Tooltip to display when hovering the icon
   */
  tooltip: string;
  /**
   * Called when the icon is clicked
   */
  onClick(e: React.MouseEvent<HTMLElement, MouseEvent>): Promise<void>;
  /**
   * Font Awesome icon to display
   */
  faIcon: IconProp;
  className?: string;
  style?: React.CSSProperties;
  id: string;
}

/**
 * Displays a Font Awesome icon with a tooltip
 */
export default function IconTooltip({
  tooltip,
  onClick,
  faIcon,
  className,
  style,
  id,
}: IconTooltipProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick: MouseEventHandler<HTMLElement> = async (e) => {
    setIsLoading(true);
    await onClick(e);
    setIsLoading(false);
  }

  return (
    <OverlayTrigger
      overlay={
        <Tooltip id={id}>
          {tooltip}
        </Tooltip>
      }
    >
      {isLoading
        ? (
          <Spinner
            animation='border'
            size='sm'
            className={className}
            variant='primary'
          />
        )
        : (
          <span onClick={handleClick} className='cursor-pointer'>
            <FontAwesomeIcon
              icon={faIcon}
              style={style}
              className={className}
            />
          </span>
        )
      }
    </OverlayTrigger>
  );
}
