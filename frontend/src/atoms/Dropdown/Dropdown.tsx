import classNames from "@/helpers/classNames";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";

/**
 * Option to be supplied in the dropdown menu
 */
export type MenuOption =
  | {
      divider?: false;
      /**
       * Text to display in the option
       */
      text: string;
      /**
       * Where does the option link to?
       */
      href?: string;
      /**
       * If `href` is not specified, the options are buttons, not links, and will call `onClick` when clicked.
       * Has no effect if `href` is specified
       */
      onClick?(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
      /**
       * Display a Font Awesome icon next to the option
       */
      faIcon?: IconProp;
      /**
       * Is the option "active"?
       */
      active?: boolean;
    }
  | {
      /**
       * If true, ignore other options and place a horizontal line in the dropdown
       */
      divider: true;
    };

interface DropdownProps {
  /**
   * Options to display in the dropdown
   */
  options: MenuOption[];
  /**
   * Element(s) to press to trigger the dropdown
   */
  children: React.ReactNode;
  /**
   * Style to apply to the outer menu
   */
  style?: React.CSSProperties;
  /**
   * Class to apply to the outer menu
   */
  className?: string;
  /**
   * Apply additional props (e.g., styling) to the menu button
   */
  menuButtonProps?: any;
  /**
   * Max height of the options popup
   */
  maxHeight?: number;
}

/**
 * Render a dropdown that triggers when an element is pressed
 */
export default function Dropdown({
  options,
  children,
  style,
  menuButtonProps,
  maxHeight,
  className,
}: DropdownProps) {
  return (
    <Menu
      as="div"
      className={classNames(className, "inline-block text-left")}
      style={{ ...style, position: "absolute", zIndex: 1 }}
    >
      <Menu.Button
        className="focus:outline-none inline-flex items-center"
        {...menuButtonProps}
      >
        {children}
      </Menu.Button>

      <Transition
        enterTo="transform opacity-100 scale-100"
        enter="ease-out duration-100"
        enterFrom="-translate-y-4 opacity-0"
        leave="ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="-translate-y-4 opacity-0"
        className="z-50"
      >
        <Menu.Items
          className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl py-1
                    text-base overflow-auto focus:outline-none shadow-md
                    sm:text-sm max-w-sm border-gray-200 border-2"
        >
          <div className="py-1" style={{ maxHeight }}>
            {options.map((option, i) =>
              option.divider ? (
                <hr className="my-2" key={i} />
              ) : (
                <Menu.Item key={i}>
                  {({ active }) =>
                    option.href ? (
                      <Link href={option.href}>
                        <a
                          className={classNames(
                            active || option.active
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700",
                            "block px-4 py-2 text-sm hover:bg-gray-200"
                          )}
                        >
                          {option.faIcon && (
                            <FontAwesomeIcon
                              icon={option.faIcon}
                              className="mr-1"
                            />
                          )}
                          {option.text}
                        </a>
                      </Link>
                    ) : (
                      <button
                        className={classNames(
                          active || option.active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm hover:bg-gray-200 w-full text-left"
                        )}
                        onClick={option.onClick}
                      >
                        {option.faIcon && (
                          <FontAwesomeIcon
                            icon={option.faIcon}
                            className="mr-1"
                          />
                        )}
                        {option.text}
                      </button>
                    )
                  }
                </Menu.Item>
              )
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
