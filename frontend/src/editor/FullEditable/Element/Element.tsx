import type { ExtendedSlateElement } from "@/editor/types";
import dynamic from "next/dynamic";
// import { Suspense } from "react";
import { Node } from "slate";

const TeX = dynamic(() => import("@/components/TeX"), {
  // suspense: true,
  suspense: false,
  loading: () => <p>Loading KaTeX...</p>,
});
const FlashcardLinkComponent = dynamic(
  () => import("@/editor/plugins/FlashcardLink/FlashcardLink"),
  {
    // suspense: true,
    suspense: false,
    loading: () => <p>Loading KaTeX...</p>,
  }
);
const LinkComponent = dynamic(() => import("@/editor/plugins/Link/Link"), {
  // suspense: true,
  suspense: false,
  loading: () => <p>Loading KaTeX...</p>,
});

interface ElementProps {
  /**
   * Attributes to be passed to the rendered element
   */
  attributes: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLUListElement>,
    HTMLUListElement
  > &
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    > &
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    > &
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLOListElement>,
      HTMLOListElement
    > &
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement>;
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
        <LinkComponent attributes={attributes} element={element}>
          {children}
        </LinkComponent>
      );
    case "flashcard-link":
      return (
        <FlashcardLinkComponent attributes={attributes} element={element}>
          {children}
        </FlashcardLinkComponent>
      );
    case "image":
      return (
        <p>
          The image choice is now deprecated. Please change{" "}
          <a target="_blank" rel="noreferrer" href={element.url}>
            {element.url && element.url.slice(0, 50)}
          </a>{" "}
          to use the new image uploading system.
        </p>
      );
    case "math-block":
      if (readOnly) {
        return (
          // <Suspense fallback={Node.string(element)}>
          <TeX math={Node.string(element)} block />
          // </Suspense>
        );
      }
      return (
        <p
          className="math-block bg-gray-300 p-3 my-1 text-center rounded-lg"
          {...attributes}
        >
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
