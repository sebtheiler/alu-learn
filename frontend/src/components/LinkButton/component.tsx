import Ripple from '@components/Button/Ripple';
import classNames from '@helpers/classNames';
import { ButtonProps } from '@components/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { buttonVariantsLookup, generateButtonClassName } from '@components/Button/component';
import { useMemo } from 'react';

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
    () => classNames(generateButtonClassName(props), 'text-white no-underline hover:no-underline'),
    [props],
  );

  return (
    <a
      className={generatedClassName}
      href={props.href}
    >
      {props.ripples && <Ripple color={buttonVariantsLookup[props.variant].rippleColor} />}
      {props.faIcon && <FontAwesomeIcon icon={props.faIcon} className='mr-1' spin={props._spin} />}
      {props.children}
    </a>
  );
}
