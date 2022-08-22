import Button from "atoms/Button";
import type { ButtonProps } from "atoms/Button";
import classNames from "helpers/classNames";
import { ReactElement } from "react";

interface ButtonGroupProps {
  /**
   * Buttons in the group. Must be instances of `atoms/Button`
   */
  children: Array<ReactElement<ButtonProps>>;
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
  return (
    <div className={classNames(className, vertical && "text-center")}>
      {children.map((button, i) => {
        const newProps: ButtonProps = { ...button.props };
        if (vertical) {
          newProps.style = { ...newProps.style, display: "block" };
          if (spaced) newProps.className += " mb-1 mx-auto";
        } else {
          if (i !== children.length - 1) {
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
        return <Button {...newProps} key={i} />;
      })}
    </div>
  );
}
