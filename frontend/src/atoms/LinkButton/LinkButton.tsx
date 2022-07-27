import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  buttonVariantsLookup,
  generateButtonClassName,
} from "atoms/Button";
import type { ButtonProps } from "atoms/Button";
import Ripple from "atoms/Button/Ripple";
import classNames from "helpers/classNames";
import Link from "next/link";
import { useMemo } from "react";

interface LinkButtonProps extends ButtonProps {
  /**
   * Href the button will link to
   */
  href: string;
}

/**
 * Creates a link styled as a button
 */
export default function LinkButton(props: LinkButtonProps) {
  const generatedClassName = useMemo(
    () =>
      classNames(
        generateButtonClassName(props),
        "text-white no-underline hover:no-underline"
      ),
    [props]
  );

  return (
    <Link href={props.href}>
      <a className={generatedClassName}>
        {props.ripples && (
          <Ripple
            color={
              props.variant
                ? buttonVariantsLookup[props.variant].rippleColor
                : "white"
            }
          />
        )}
        {props.faIcon && (
          <FontAwesomeIcon
            icon={props.faIcon}
            className="mr-1"
            spin={props._spin}
          />
        )}
        {props.children}
      </a>
    </Link>
  );
}
