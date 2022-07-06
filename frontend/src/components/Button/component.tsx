import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Ripple from './Ripple';

export interface ButtonProps {
  /**
   * Children of the button
   */
  children: React.ReactNode;
  /**
   * Colorscheme variant of the button
   */
  variant?: 'primary' | 'primary-outline' | 'white' | 'gradient';
  /**
   * Class to apply to the button
   */
  className?: string;
  /**
   * Function to run when the button is clicked
   */
  onClick?(event: React.MouseEvent<HTMLButtonElement>): void;
  /**
   * Fully round the button's corners?
   */
  pill?: boolean;
  /**
   * Render the button with full width?
   */
  block?: boolean;
  /**
   * Display ripples when clicked?
   */
  ripples?: boolean;
  /**
   * Font Awesome icon to display next to the button text
   */
  faIcon?: IconProp;
  /**
   * Type of the button
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Spin the icon
   */
  _spin?: boolean;
  /**
   * Remove the rounded corners from the right
   */
  _unroundRight?: boolean;
  /**
   * Remove the rounded corners from the left
   */
  _unroundLeft?: boolean;
}

const colors = {
  primary: {
    className: `bg-alu-primary-purple hover:bg-alu-primary-purple-darkened border-2 border-alu-primary-purple
                text-white focus:outline-none focus:ring focus:ring-violet-400`,
    rippleColor: 'white'
  },
  'primary-outline': {
    className: `bg-white hover:bg-alu-primary-purple text-alu-primary-purple
                hover:text-white border-2 border-alu-primary-purple
                focus:outline-none focus:ring focus:ring-violet-400`,
    rippleColor: 'lightgray',
  },
  white: {
    className: `bg-white hover:bg-gray-100 text-black border-2 border-gray-200
                focus:outline-none focus:ring focus:ring-gray-400/20`,
    rippleColor: 'lightgray',
  },
  gradient: { className: 'bg-gradient-to-br from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white', rippleColor: 'white' },
}

/**
 * Renders a button
 */
export default function Button({
  children,
  variant='primary',
  className='',
  onClick,
  pill=true,
  block=false,
  ripples=true,
  faIcon,
  type='button',
  _spin=false,
  _unroundRight=false,
  _unroundLeft=false,
}: ButtonProps) {
  return (
    <button
      className={className + ' px-6 py-2.5 hover:shadow-md transition relative overflow-hidden '
                  + colors[variant].className
                  + (pill ? ' rounded-full' : ' rounded')
                  + (block ? ' w-full' : '')
                  + (_unroundRight ? ' rounded-r-none' : '')
                  + (_unroundLeft ? ' rounded-l-none' : '')
                }
      onClick={onClick}
      type={type}
    >
      {ripples && <Ripple color={colors[variant].rippleColor} />}
      {faIcon && <FontAwesomeIcon icon={faIcon} className='mr-1' spin={_spin} />}
      {children}
    </button>
  );
}
