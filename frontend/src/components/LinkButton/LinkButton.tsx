import Link from "next/link";
import Ripple from "components/Button/Ripple";
import classNames from "helpers/classNames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  buttonVariantsLookup,
  generateButtonClassName,
} from "components/Button";
import { useMemo } from "react";

import type { ButtonProps } from "components/Button";

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
    <Link className={generatedClassName} href={props.href}>
      <>
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
      </>
    </Link>
  );
}
