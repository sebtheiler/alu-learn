import Tooltip from "@/atoms/Tooltip";
import type { TooltipProps } from "@/atoms/Tooltip/Tooltip";
import classNames from "@/helpers/classNames";
import type { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEventHandler, useMemo, useState } from "react";

interface IconTooltipProps {
  /**
   * Tooltip to display when hovering the icon
   */
  tooltip: React.ReactNode;
  /**
   * Called when the icon is clicked
   */
  onClick(e: React.MouseEvent<HTMLElement, MouseEvent>): Promise<any> | any;
  /**
   * Size of the icon
   */
  size?: SizeProp;
  /**
   * Font Awesome icon to display
   */
  faIcon: IconProp;
  /**
   * Classname of the icon
   */
  className?: string;
  /**
   * Additional styling for the icon
   */
  style?: React.CSSProperties;
  /**
   * Additional props for the tooltip
   */
  tooltipProps?: Partial<TooltipProps>;
}

/**
 * Displays a Font Awesome icon with a tooltip
 */
export default function IconTooltip({
  tooltip,
  onClick,
  faIcon,
  size,
  className,
  style,
  tooltipProps,
}: IconTooltipProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick: MouseEventHandler<HTMLElement> = async (e) => {
    setIsLoading(true);
    await onClick(e);
    setIsLoading(false);
  };

  const icon = useMemo(
    () => (isLoading ? faSpinner : faIcon),
    [isLoading, faIcon]
  );

  return (
    <Tooltip tooltip={tooltip} {...tooltipProps}>
      <span
        onClick={handleClick}
        className="cursor-pointer text-center"
        role="button"
      >
        <FontAwesomeIcon
          icon={icon}
          style={style}
          className={classNames(className, "mx-auto")}
          spin={isLoading}
          size={size}
        />
      </span>
    </Tooltip>
  );
}
