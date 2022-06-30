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

// import katex from 'katex';
// import { useMemo } from 'react';
// // import katex, { KatexOptions, TrustContext } from 'katex';

// export default function Latex({ src, block }: { src: string, block?: boolean }) {
//   const texStr = useMemo(
//     () => {
//       try {
//         return katex.renderToString(src, { displayMode: block });
//       } catch (err) {
//         console.error('Couldn\'t convert string', src);
//         return src;
//       }
//     },
//     [src, block],
//   );

//   return <span dangerouslySetInnerHTML={{ __html: texStr }} />
// }

// // interface ResultType {
// //   string: string;
// //   type: 'block' | 'text' | 'inline';
// // }

// // const latexify = (string: string, options: KatexOptions) => {
// //   const regularExpression = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^\$\\]*(?:\\.[^\$\\]*)*\$/g;
// //   const blockRegularExpression = /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]/g;

// //   const stripDollars = (stringToStrip: string) =>
// //     (stringToStrip[0] === '$' && stringToStrip[1] !== '$'
// //       ? stringToStrip.slice(1, -1)
// //       : stringToStrip.slice(2, -2));

// //   const getDisplay = (stringToDisplay: string) =>
// //     (stringToDisplay.match(blockRegularExpression) ? 'block' : 'inline');

// //   const renderLatexString = (tex: string, renderType: 'block' | 'text' | 'inline') => {
// //     try {
// //       return katex.renderToString(
// //         tex,
// //         renderType === 'block' ? Object.assign({ displayMode: true }, options) : options
// //       );
// //     } catch (err) {
// //       console.error('Couldn\'t convert string', tex);
// //       return tex;
// //     }
// //   }

// //   const result: ResultType[] = [];

// //   const latexMatch = string.match(regularExpression);
// //   const stringWithoutLatex = string.split(regularExpression);

// //   if (latexMatch) {
// //     stringWithoutLatex.forEach((s, index) => {
// //       result.push({
// //         string: s,
// //         type: "text",
// //       });
// //       if (latexMatch[index]) {
// //         result.push({
// //           string: stripDollars(latexMatch[index]),
// //           type: getDisplay(latexMatch[index]),
// //         });
// //       }
// //     });
// //   } else {
// //     result.push({
// //       string,
// //       type: "text",
// //     });
// //   }

// //   const processResult = (resultToProcess: ResultType[]) => {
// //     const newResult = resultToProcess.map((r) => {
// //       if (r.type === "text") {
// //         return r.string;
// //       }
// //       return <span dangerouslySetInnerHTML={{__html: renderLatexString(r.string, r.type)}} />
// //     });

// //     return newResult;
// //   }

// //   // Returns list of spans with latex and non-latex strings.
// //   return processResult(result);
// // }

// // interface LatexProps {
// //   children: string;
// //   displayMode?: boolean;
// //   leqno?: boolean;
// //   fleqn?: boolean;
// //   throwOnError?: boolean;
// //   errorColor?: string;
// //   macros?: object;
// //   minRuleThickness?: number;
// //   colorIsTextColor?: boolean;
// //   maxSize?: number;
// //   maxExpand?: number;
// //   strict?: boolean | string | Function;
// //   trust?: boolean | ((context: TrustContext) => boolean);
// // }
// // export default function Latex(props: LatexProps) {
// //   const {
// //     children='',
// //     displayMode=false,
// //     leqno=false,
// //     fleqn=false,
// //     throwOnError=true,
// //     errorColor='#cc0000',
// //     macros={},
// //     minRuleThickness=0,
// //     colorIsTextColor=false,
// //     maxSize,
// //     maxExpand,
// //     strict='warn',
// //     trust=false,
// //   } = props;

// //   // const renderUs: (string | JSX.Element | null)[] = latexify(children, {
// //   const renderUs = latexify(children, {
// //     displayMode,
// //     leqno,
// //     fleqn,
// //     throwOnError,
// //     errorColor,
// //     macros,
// //     minRuleThickness,
// //     colorIsTextColor,
// //     maxSize,
// //     maxExpand,
// //     strict,
// //     trust,
// //   });
// //   // renderUs.unshift(null);
// //   renderUs.unshift('span');

// //   // return React.createElement(renderUs);
// //   return <>{renderUs.map(el => el)}</>;
// // }
