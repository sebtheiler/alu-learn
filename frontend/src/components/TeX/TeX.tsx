// Taken from https://github.com/MatejBransky/react-katex/blob/master/src/index.tsx
import KaTeX from "katex";
import type { KatexOptions } from "katex";
import React, {
  useState,
  useEffect,
  ReactElement,
  ElementType,
  memo,
} from "react";

interface TeXProps {
  /**
   * LaTeX code to render
   */
  math: string;
  /**
   * Render the LaTeX as a block as opposed to inline?
   */
  block?: boolean;
  /**
   * Color of the text displayed when there is an error
   */
  errorColor?: string;
  renderError?: (error: Error) => ReactElement;
  settings?: KatexOptions;
  as?: ElementType;
  onClick?(event: any): any;
}

/**
 * Renders LaTeX as an SVG
 */
const TeX: React.FC<TeXProps> = ({
  math,
  block = false,
  errorColor = "#D73737",
  renderError,
  settings,
  as: asComponent,
  onClick,
  ...props
}) => {
  const Component = asComponent || (block ? "div" : "span");
  const [state, setState] = useState<
    { innerHtml: string } | { errorElement: React.ReactElement }
  >({ innerHtml: "" });

  useEffect(() => {
    try {
      const innerHtml = KaTeX.renderToString(math, {
        displayMode: !!block,
        errorColor,
        throwOnError: !!renderError,
        ...settings,
      });

      setState({ innerHtml });
    } catch (error) {
      if (renderError) {
        setState({ errorElement: renderError(error as Error) });
      } else {
        setState({ innerHtml: (error as Error)?.message });
      }
    }
  }, [block, math, errorColor, renderError, settings]);

  if ("errorElement" in state) {
    return state.errorElement;
  }

  return (
    <Component
      {...props}
      style={{
        fontFamily: 'KaTeX_Main, "Times New Roman", serif',
        userSelect: "none",
      }}
      dangerouslySetInnerHTML={{ __html: state.innerHtml }}
      contentEditable={false}
      onClick={onClick}
    />
  );
};

export default memo(TeX);
