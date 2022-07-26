import classNames from '@helpers/classNames';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { lazy, Suspense } from 'react';

import type { IconProp } from '@fortawesome/fontawesome-svg-core';

const FontAwesomeIcon = lazy(()=> import('@fortawesome/react-fontawesome').then(module=>({default:module.FontAwesomeIcon})))


/**
 * Option to be supplied in the dropdown menu
 */
interface MenuOption {
  /**
   * Text to display in the option
   */
  text?: string;
  /**
   * Where does the option link to?
   */
  href?: string;
  /**
   * Display a Font Awesome icon next to the option
   */
  faIcon?: IconProp;
  /**
   * If true, ignore other options and place a horizontal line in the dropdown
   */
  divider?: boolean;
}

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
    <Menu as='div' className={classNames(className, 'inline-block text-left')} style={style}>
      <Menu.Button className='focus:outline-none'>
        {children}
      </Menu.Button>

      <Transition
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Items className='origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none'>
          <div className='py-1'>
            {options.map((option, i) => (option.divider ? <hr className='my-2' /> : <Menu.Item key={i}>
              {({ active }) => (
                <Link
                  to={option.href}
                  className={classNames(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block px-4 py-2 text-sm'
                  )}
                >
                  <Suspense fallback=''>
                    <FontAwesomeIcon icon={option.faIcon} className='mr-1' />
                  </Suspense>
                  {option.text}
                </Link>
              )}
            </Menu.Item>))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
