import classNames from "helpers/classNames";
import { Transition } from "@headlessui/react";
import { usePopper } from "react-popper";
import { useState } from "react";

import type { Placement } from "@popperjs/core";

interface TooltipProps {
  /**
   * Elements that, when hovered, will display the tooltip
   */
  children: React.ReactNode;
  /**
   * Tooltip to display when hovering children
   */
  tooltip: React.ReactNode;
  /**
   * Additional class for the tooltip
   */
  className?: string;
  /**
   * Placement for the tooltip
   */
  placement?: Placement;
}

/**
 * Renders a tooltip over some elements
 */
export default function Tooltip({
  children,
  tooltip,
  className,
  placement = "top",
}: TooltipProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const [refEl, setRefEl] = useState<HTMLElement>();
  const [popEl, setPopEl] = useState<HTMLElement>();
  const { styles, attributes } = usePopper(refEl, popEl, {
    placement: placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
    ],
  });

  return (
    <div className="inline">
      <span
        ref={setRefEl}
        onMouseEnter={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
      >
        {children}
      </span>
      <Transition
        show={isTooltipOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="absolute"
      >
        <div
          ref={setPopEl}
          role="tooltip"
          className={classNames(
            "bg-gray-900 bg-opacity-90 text-white px-2 py-1\
                                  rounded-lg absolute text-sm select-none text-center z-50",
            className
          )}
          // Keep tooltip open when hovered
          onMouseEnter={() => setIsTooltipOpen(true)}
          onMouseLeave={() => setIsTooltipOpen(false)}
          // Popper style and attributes
          style={styles.popper}
          {...attributes.popper}
        >
          {tooltip}
        </div>
      </Transition>
    </div>
  );
}
