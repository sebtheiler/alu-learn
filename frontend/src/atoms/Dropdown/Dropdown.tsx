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
      href: string;
      /**
       * Optionally call a function when the option is clicked
       */
      onClick?(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void;
      /**
       * Display a Font Awesome icon next to the option
       */
      faIcon?: IconProp;
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
}

/**
 * Render a dropdown that triggers when an element is pressed
 */
export default function Dropdown({
  options,
  children,
  style,
  className,
}: DropdownProps) {
  return (
    <Menu
      as="div"
      className={classNames(className, "inline-block text-left")}
      style={style}
    >
      <Menu.Button className="focus:outline-none inline-flex items-center">
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
          <div className="py-1">
            {options.map((option, i) =>
              option.divider ? (
                <hr className="my-2" key={i} />
              ) : (
                <Menu.Item key={i}>
                  {({ active }) => (
                    <Link href={option.href}>
                      <a
                        className={classNames(
                          active
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-700",
                          "block px-4 py-2 text-sm hover:bg-gray-200"
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
                      </a>
                    </Link>
                  )}
                </Menu.Item>
              )
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
