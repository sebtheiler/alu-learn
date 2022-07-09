import Ripple from '@components/Button/Ripple';
import classNames from '@helpers/classNames';
import { Link } from 'react-router-dom';
import { buttonVariantsLookup, generateButtonClassName } from '@components/Button/component';
import { useMemo, lazy, Suspense } from 'react';

import type { ButtonProps } from '@components/Button';

const FontAwesomeIcon = lazy(()=> import('@fortawesome/react-fontawesome').then(module=>({default:module.FontAwesomeIcon})))

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
    <Link
      className={generatedClassName}
      to={props.href}
    >
      {props.ripples && <Ripple color={buttonVariantsLookup[props.variant].rippleColor} />}
      {props.faIcon && <Suspense fallback=''>
        <FontAwesomeIcon icon={props.faIcon} className='mr-1' spin={props._spin} />
      </Suspense>}
      {props.children}
    </Link>
  );
}
