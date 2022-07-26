import classNames from "helpers/classNames";
import useOutsideClick from "hooks/useClickOutside";
import { Transition } from "@headlessui/react";
import { useMemo, useState } from "react";
import { usePopper } from "react-popper";

import type { Placement } from "@popperjs/core";

interface PopoverProps {
  /**
   * Elements that, when hovered, will display the popover
   */
  children: React.ReactNode;
  /**
   * Popover to display when hovering children
   */
  popover: React.ReactNode;
  /**
   * Additional class for the popover
   */
  className?: string;
  /**
   * Placement for the popover
   */
  placement?: Placement;
  /**
   * What mouse action triggers the popover
   */
  trigger?: "hover" | "click";
}

/**
 * Renders a popover when the children elements are hovered.
 * Popover can contain any content.
 */
export default function Popover({
  children,
  popover,
  className,
  placement = "top",
  trigger = "hover",
}: PopoverProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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

  const triggetAttrs = useMemo(() => {
    switch (trigger) {
      case "hover":
        return {
          onMouseEnter: () => setIsPopoverOpen(true),
          onMouseLeave: () => setIsPopoverOpen(false),
        };
      case "click":
        return {
          onClick: () => setIsPopoverOpen(true),
        };
    }
  }, [trigger]);

  useOutsideClick(popEl, () => {
    if (trigger === "click") {
      setIsPopoverOpen(false);
    }
  });

  return (
    <div className="inline">
      <span ref={setRefEl} {...triggetAttrs}>
        {children}
      </span>
      <Transition
        show={isPopoverOpen}
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
          className={classNames(
            "border-4 border-alu-mid-gray bg-alu-light-gray\
                                 px-4 py-3 w-64 rounded-xl z-50",
            className
          )}
          // Popper style, attributes, and trigger attributes
          style={styles.popper}
          {...triggetAttrs}
          {...attributes.popper}
        >
          {popover}
        </div>
      </Transition>
    </div>
  );
}
