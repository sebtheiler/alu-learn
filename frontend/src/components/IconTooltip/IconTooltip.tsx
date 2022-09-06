import Tooltip from "@/atoms/Tooltip";
import type { TooltipProps } from "@/atoms/Tooltip/Tooltip";
import classNames from "@/helpers/classNames";
import type { IconProp, SizeProp } from "@fortawesome/fontawesome-svg-core";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";

interface IconTooltipProps {
  /**
   * Tooltip to display when hovering the icon
   */
  tooltip: React.ReactNode;
  /**
   * Called when the icon is clicked
   */
  onClick?(e: React.MouseEvent<HTMLElement, MouseEvent>): Promise<any> | any;
  /**
   * Called when the icon is double clicked
   */
  onDoubleClick?(
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ): Promise<any> | any;
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
  onDoubleClick,
  faIcon,
  size,
  className,
  style,
  tooltipProps,
}: IconTooltipProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick: React.MouseEventHandler<HTMLSpanElement> = async (e) => {
    if (!onClick) return;
    setIsLoading(true);
    Promise.resolve(onClick(e)).finally(() => setIsLoading(false));
  };

  const handleDoubleClick: React.MouseEventHandler<HTMLSpanElement> = async (
    e
  ) => {
    if (!onDoubleClick) return;
    setIsLoading(true);
    Promise.resolve(onDoubleClick(e)).finally(() => setIsLoading(false));
  };

  const icon = useMemo(
    () => (isLoading ? faSpinner : faIcon),
    [isLoading, faIcon]
  );

  return (
    <Tooltip tooltip={tooltip} {...tooltipProps}>
      <span
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={classNames(className, "cursor-pointer text-center")}
        role="button"
      >
        <FontAwesomeIcon
          icon={icon}
          style={style}
          className="mx-auto"
          spin={isLoading}
          size={size}
        />
      </span>
    </Tooltip>
  );
}
