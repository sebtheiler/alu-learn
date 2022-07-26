import { Suspense, lazy } from "react";
import { Node } from "slate";

import type { ExtendedSlateElement } from "editor/types";

const TeX = lazy(() => import("components/TeX"));
const FlashCardLinkComponent = lazy(
  () => import("@slate-plugins/FlashcardLink")
);
const LinkComponent = lazy(() => import("@slate-plugins/Link"));

interface ElementProps {
  /**
   * Attributes to be passed to the rendered element
   */
  attributes: any;
  /**
   * Children of the rendered element
   */
  children: React.ReactNode;
  /**
   * Slate element to render
   */
  element: ExtendedSlateElement;
  /**
   * Is the element read only?
   */
  readOnly: boolean;
}

/**
 * Render an element for the SlateJS editor
 */
const Element = ({ attributes, children, element, readOnly }: ElementProps) => {
  switch (element.type) {
    case "bulleted-list":
      return (
        <ul {...attributes} style={{ listStylePosition: "inside" }}>
          {children}
        </ul>
      );
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "heading-three":
      return <h3 {...attributes}>{children}</h3>;
    case "heading-four":
      return <h4 {...attributes}>{children}</h4>;
    case "heading-five":
      return <h5 {...attributes}>{children}</h5>;
    case "heading-six":
      return <h6 {...attributes}>{children}</h6>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return (
        <ol {...attributes} style={{ listStylePosition: "inside" }}>
          {children}
        </ol>
      );
    case "link":
      return (
        <LinkComponent
          attributes={attributes}
          children={children}
          element={element}
        />
      );
    case "flashcard-link":
      return (
        <FlashCardLinkComponent
          attributes={attributes}
          children={children}
          element={element}
        />
      );
    case "image":
      return (
        <p>
          The image choice is now deprecated. Please change{" "}
          <a target="_blank" rel="noreferrer" href={element.url}>
            {element.url.slice(0, 50)}
          </a>{" "}
          to use the new image uploading system.
        </p>
      );
    case "math-block":
      if (readOnly) {
        return (
          <Suspense fallback={<p>Loading KaTeX...</p>}>
            <TeX math={Node.string(element)} block />
          </Suspense>
        );
      }
      return (
        <p className="math-block" {...attributes}>
          {children}
        </p>
      );
    default:
      return (
        <p {...attributes} className="mb-0">
          {children}
        </p>
      );
  }
};

export default Element;
