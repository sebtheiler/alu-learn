// Taken from https://github.com/MatejBransky/react-katex/blob/master/src/index.tsx

import React, {
  ComponentPropsWithoutRef,
  useState,
  useEffect,
  ReactElement,
  ElementType,
  memo,
} from 'react';
import KaTeX, { KatexOptions } from 'katex';

const TeX: React.FC<TeXProps> = ({
  children,
  math,
  block,
  errorColor,
  renderError,
  settings,
  as: asComponent,
  ...props
}) => {
  const Component = asComponent || (block ? 'div' : 'span');
  const content = (children ?? math) as string;
  const [state, setState] = useState<
    { innerHtml: string } | { errorElement: React.ReactElement }
  >({ innerHtml: '' });

  useEffect(() => {
    try {
      const innerHtml = KaTeX.renderToString(content, {
        displayMode: !!block,
        errorColor,
        throwOnError: !!renderError,
        ...settings,
      });

      setState({ innerHtml });
    } catch (error) {
      // if (error instanceof ParseError || error instanceof TypeError) {
      if (renderError) {
        setState({ errorElement: renderError(error as Error) });
      } else {
        setState({ innerHtml: (error as Error)?.message });
      }
      // } else {
      //   throw error;
      // }
    }
  }, [block, content, errorColor, renderError, settings]);

  if ('errorElement' in state) {
    return state.errorElement;
  }

  return (
    <Component
      {...props}
      dangerouslySetInnerHTML={{ __html: state.innerHtml }}
    />
  );
};

export default memo(TeX);

type TeXProps = ComponentPropsWithoutRef<'div'> &
  Partial<{
    as: ElementType;
    math: string | number;
    block: boolean;
    errorColor: string;
    // renderError: (error: ParseError | TypeError) => ReactElement;
    renderError: (error: Error) => ReactElement;
    settings: KatexOptions;
  }>;