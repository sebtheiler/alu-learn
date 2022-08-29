import type { ExtendedSlateElement } from "../../types";
import Tooltip from "@/atoms/Tooltip";
import utm from "@/helpers/utm";

interface LinkComponentProps {
  /**
   * Attributes passed to the `<a>` element
   */
  attributes: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >;
  /**
   * Children of the `<a>` element
   */
  children: React.ReactNode;
  /**
   * SlateJS Element to render
   */
  element: ExtendedSlateElement;
}

/**
 * Render a link component in the SlateJS editor
 */
export default function LinkComponent({
  attributes,
  children,
  element,
}: LinkComponentProps) {
  return (
    <Tooltip
      tooltip={
        <a
          href={
            element.url && utm(element.url, { source: "alu_learn", medium: "" })
          }
          style={{ color: "white" }}
          target="_blank"
          rel="noreferrer ugc nofollow"
        >
          {element.url &&
            (element.url.length > 50
              ? element.url.substring(0, 15) +
                "   ...   " +
                element.url.substring(
                  element.url.length - 10,
                  element.url.length
                )
              : element.url)}
        </a>
      }
      className="text-blue-300 underline"
    >
      <a
        {...attributes}
        className="text-blue-600 underline hover:text-blue-800"
        href={
          element.url && utm(element.url, { source: "alu_learn", medium: "" })
        }
        target="_blank"
        rel="noreferrer ugc nofollow"
      >
        {children}
      </a>
    </Tooltip>
  );
}
