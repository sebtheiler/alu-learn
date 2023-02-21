import styles from "./Popover.module.scss";
import classNames from "helpers-lib/src/classNames";
import useOutsideClick from "helpers-lib/src/hooks/useClickOutside";
import { Transition } from "@headlessui/react";
import type { Placement } from "@popperjs/core";
import { useMemo, useState } from "react";
import { usePopper } from "react-popper";

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
  /**
   * Display an arrow connecting the popover to its children?
   */
  arrow?: boolean;
  /**
   * Call a function when the popover is opened (either by hovering or click)
   */
  onOpenCallback?(): void;
  /**
   * Call a function when the popover is closed (either by hovering or click)
   */
  onCloseCallback?(): void;
  /**
   * Override the automatic handling of open/closed state by manually
   * specifying the `open` attribute.  Do not use unless absolutely required
   */
  open?: boolean;
}

/**
 * Renders a popover when the children elements are hovered.
 * Popover can contain any content.
 */
export default function Popover({
  children,
  popover,
  className,
  placement = "bottom",
  trigger = "hover",
  arrow,
  onOpenCallback,
  onCloseCallback,
  open,
}: PopoverProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const [refEl, setRefEl] = useState<HTMLElement | null>();
  const [popEl, setPopEl] = useState<HTMLElement | null>();
  const [arrowEl, setArrowEl] = useState<HTMLElement | null>();
  const { styles: popperStyles, attributes } = usePopper(refEl, popEl, {
    placement: placement,
    modifiers: [
      {
        name: "offset",
        options: {
          offset: [0, 8],
        },
      },
      {
        name: "arrow",
        options: {
          element: arrowEl,
        },
      },
    ],
  });

  const triggerAttrs = useMemo(() => {
    switch (trigger) {
      case "hover": {
        const attrs = {
          onMouseEnter: () => {
            setIsPopoverOpen(true);
            onOpenCallback && onOpenCallback();
          },
          onMouseLeave: () => {
            setIsPopoverOpen(false);
            onCloseCallback && onCloseCallback();
          },
        };
        return { button: attrs, popover: attrs };
      }
      case "click":
        return {
          button: {
            onClick: () => {
              setIsPopoverOpen(true);
              onOpenCallback && onOpenCallback();
            },
          },
          popover: undefined,
        };
    }
  }, [trigger, onOpenCallback, onCloseCallback]);

  useOutsideClick(popEl as HTMLElement, () => {
    if (trigger === "click") {
      setIsPopoverOpen(false);
      onCloseCallback && onCloseCallback();
    }
  });

  return (
    <div className="inline">
      <span ref={setRefEl} {...triggerAttrs.button}>
        {children}
      </span>
      <Transition
        show={open ?? isPopoverOpen}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="absolute z-50"
      >
        <div
          ref={setPopEl}
          className={classNames(
            "w-64 rounded-xl border-4 bg-gray-50 px-4 py-3",
            styles.popover,
            className
          )}
          // Popper style, attributes, and trigger attributes
          style={popperStyles.popper}
          {...triggerAttrs.popover}
          {...attributes.popper}
        >
          {popover}
          {arrow && (
            <div
              ref={setArrowEl}
              style={popperStyles.arrow}
              className={styles.popoverArrow}
            />
          )}
        </div>
      </Transition>
    </div>
  );
}
