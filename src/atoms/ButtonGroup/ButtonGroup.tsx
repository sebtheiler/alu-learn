import type { ButtonProps } from "@/atoms/Button";
import classNames from "@/helpers/classNames";
import { Fragment, cloneElement } from "react";

interface ButtonGroupProps {
  /**
   * Buttons in the group. Must be instances of `atoms/Button`
   */
  children: Array<React.ReactElement<ButtonProps> | false | null | undefined>;
  /**
   * Put spaces between each button?
   */
  spaced?: boolean;
  /**
   * If specified, apply a fixed width to each button
   * E.g., 100px
   */
  fixedWidth?: string;
  /**
   * Display the buttons stacked vertically instead of horizontally?
   */
  vertical?: boolean;
  /**
   * Classname to apply to the div surrounding the children buttons
   */
  className?: string;
}

/**
 * Renders a button group that automatically styles the border radius on its buttons
 */
export default function ButtonGroup({
  children,
  spaced,
  fixedWidth,
  vertical,
  className,
}: ButtonGroupProps) {
  // This is required so that falsey elements don't throw off which
  // buttons get rounded corners
  const filteredChildren = children.filter((child) => !!child);

  return (
    <div className={classNames(className, vertical && "text-center")}>
      {filteredChildren.map((button, i) => {
        if (!button) return;
        const newProps: ButtonProps = { ...button.props };
        if (vertical) {
          newProps.style = { ...newProps.style, display: "block" };
          if (spaced) newProps.className += " mb-1 mx-auto";
        } else {
          if (i !== filteredChildren.length - 1) {
            newProps._unroundRight = true;
            if (spaced) newProps.className += " mr-1";
          }
          if (i !== 0) {
            newProps._unroundLeft = true;
          }
        }
        if (fixedWidth) {
          newProps.style = { ...newProps.style, width: fixedWidth };
        }
        return <Fragment key={i}>{cloneElement(button, newProps)}</Fragment>;
      })}
    </div>
  );
}
