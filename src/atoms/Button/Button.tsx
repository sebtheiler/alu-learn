import Ripple from "./Ripple/Ripple";
import classNames from "@/helpers/classNames";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";

export interface ButtonProps {
  /**
   * Children of the button
   */
  children?: React.ReactNode;
  /**
   * Colorscheme variant of the button
   */
  variant?: keyof typeof buttonVariantsLookup;
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
  type?: "button" | "submit" | "reset";
  /**
   * Apply extra styling to the button
   */
  style?: React.CSSProperties;
  /**
   * Autofocus the button
   */
  autoFocus?: boolean;
  /**
   * Disable the button
   */
  disabled?: boolean;
  /**
   * Title
   */
  title?: string;
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

/**
 * Maps button variants to classnames and ripple colors
 */
export const buttonVariantsLookup = {
  primary: {
    className: `bg-alu-primary-purple hover:bg-alu-primary-purple-darkened border-2 border-alu-primary-purple
                text-white focus:outline-none focus:ring focus:ring-violet-400`,
    rippleColor: "white",
  },
  "primary-outline": {
    className: `bg-inherit hover:bg-alu-primary-purple text-alu-primary-purple
                hover:text-white border-2 border-alu-primary-purple
                focus:outline-none focus:ring focus:ring-violet-400`,
    rippleColor: "lightgray",
  },
  white: {
    className: `bg-white hover:bg-gray-100 text-black border-2 border-gray-200
                focus:outline-none focus:ring focus:ring-gray-400/20`,
    rippleColor: "lightgray",
  },
  red: {
    className: `bg-red-600 hover:bg-red-700 border-2 border-red-600 text-white focus:outline-none
                focus:ring focus:ring-red-400/50`,
    rippleColor: "white",
  },
  secondary: {
    className: `bg-gray-600 hover:bg-gray-700 border-2 border-gray-600 text-white focus:outline-none
                focus:ring focus:ring-gray-400/50`,
    rippleColor: "white",
  },
  yellow: {
    className: `bg-yellow-500 hover:bg-yellow-600 border-2 border-yellow-500 text-white focus:outline-none
                focus:ring focus:ring-yellow-300/50`,
    rippleColor: "white",
  },
  green: {
    className: `bg-green-600 hover:bg-green-700 border-2 border-green-600 text-white focus:outline-none
                focus:ring focus:ring-green-400/50`,
    rippleColor: "white",
  },
  blue: {
    className: `bg-blue-600 hover:bg-blue-700 border-2 border-blue-600 text-white focus:outline-none
                focus:ring focus:ring-blue-400/50`,
    rippleColor: "white",
  },
  transparent: {
    className: `bg-transparent hover:bg-black/10 border-4 border-black/10 text-white focus:outline-none
                focus:ring focus:ring-black-400/50`,
    rippleColor: "rgba(255, 255, 255, 0.5)",
  },
};

/**
 * Generates the classname for a button, given some props
 * @returns The generated class name
 */
export const generateButtonClassName = ({
  className = "",
  variant = "primary",
  pill = true,
  block = false,
  disabled = false,
  _unroundRight = false,
  _unroundLeft = false,
}: Partial<ButtonProps>) => {
  return classNames(
    className,
    "px-6 py-2.5 hover:shadow-md transition relative overflow-hidden",
    disabled && "hover:cursor-not-allowed opacity-75",
    buttonVariantsLookup[variant].className,
    pill ? " rounded-full" : " rounded",
    block ? " w-full" : "",
    _unroundRight ? " rounded-r-none" : "",
    _unroundLeft ? " rounded-l-none" : ""
  );
};

/**
 * Renders a button
 */
export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  pill = true,
  block = false,
  ripples = true,
  faIcon,
  type = "button",
  style,
  autoFocus = false,
  disabled = false,
  title,
  _spin = false,
  _unroundRight = false,
  _unroundLeft = false,
}: ButtonProps) {
  const generatedClassName = useMemo(
    () =>
      generateButtonClassName({
        variant,
        pill,
        block,
        disabled,
        _unroundRight,
        _unroundLeft,
        className,
      }),
    [className, variant, pill, block, disabled, _unroundRight, _unroundLeft]
  );

  return (
    <button
      className={generatedClassName}
      onClick={disabled ? undefined : onClick}
      type={type}
      style={style}
      autoFocus={autoFocus}
      disabled={disabled}
      title={title}
    >
      {ripples && !disabled && (
        <Ripple color={buttonVariantsLookup[variant].rippleColor} />
      )}
      {faIcon && (
        <FontAwesomeIcon
          icon={faIcon}
          className={children ? "mr-1" : ""}
          spin={_spin}
        />
      )}
      {children}
    </button>
  );
}
