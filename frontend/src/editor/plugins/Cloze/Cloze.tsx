interface ClozeProps {
  /**
   * Attributes passed to the `<a>` element
   */
  attributes?: React.DetailedHTMLProps<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    HTMLAnchorElement
  >;
  /**
   * Children of the `<a>` element
   */
  children: React.ReactNode;
  /**
   * If true, reveal the text hidden in the cloze deletion
   * @note This is a custom attribute and not standard on Slate components
   */
  revealAnswer: boolean;
}

/**
 *
 */
export default function ClozeComponent({
  attributes,
  children,
  revealAnswer,
}: ClozeProps) {
  if (revealAnswer) {
    return (
      <span className="bg-yellow-300 font-bold" {...attributes}>
        {children}
      </span>
    );
  } else {
    return (
      <span
        className="bg-yellow-300 text-red-600 font-bold hover:cursor-help"
        {...attributes}
      >
        [...]
      </span>
    );
  }
}
