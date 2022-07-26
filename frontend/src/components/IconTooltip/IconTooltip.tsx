import Tooltip from "components/Tooltip";
import classNames from "helpers/classNames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MouseEventHandler, useMemo, useState } from "react";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

import type { IconProp } from "@fortawesome/fontawesome-svg-core";

interface IconTooltipProps {
  /**
   * Tooltip to display when hovering the icon
   */
  tooltip: React.ReactNode;
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
    <Tooltip tooltip={tooltip}>
      <span onClick={handleClick} className="cursor-pointer text-center">
        <FontAwesomeIcon
          icon={icon}
          style={style}
          className={classNames(className, "mx-auto")}
          spin={isLoading}
        />
      </span>
    </Tooltip>
  );
}
