import { lazy, Suspense } from "react";

const TeX = lazy(() => import("@/components/TeX"));

const Leaf = ({ attributes, children, leaf, readOnly }) => {
  if (leaf.bold) children = <strong>{children}</strong>;

  if (leaf.code) children = <code>{children}</code>;

  if (leaf.italic) children = <em>{children}</em>;

  if (leaf.underline) children = <u>{children}</u>;

  if (leaf.math_inline) {
    if (readOnly) {
      children = (
        <Suspense fallback="Loading KaTeX">
          <TeX math={children.props.text.text} />
        </Suspense>
      );
    } else {
      children = <span className="math-inline bg-gray-300">{children}</span>;
    }
  }

  return <span {...attributes}>{children}</span>;
};

export default Leaf;
