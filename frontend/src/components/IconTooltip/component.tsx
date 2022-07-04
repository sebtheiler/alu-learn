import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { createRef, MouseEventHandler, useState } from 'react';
import { usePopper } from 'react-popper';
import Tooltip from '@components/Tooltip';


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
    <Tooltip>
      <span onClick={handleClick} className={'cursor-pointer ' + className}>
        <FontAwesomeIcon
          icon={faIcon}
          style={style}
          className={className}
          data-tooltip-target='tooltip-animation'
        />
      </span>
    </Tooltip>
  );
}
