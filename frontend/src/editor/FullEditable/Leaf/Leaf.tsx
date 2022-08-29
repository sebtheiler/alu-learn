import ClozeComponent from "@/editor/plugins/Cloze";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const TeX = dynamic(() => import("@/components/TeX"), {
  // suspense: true,
  suspense: false,
  loading: () => <p>Loading KaTeX...</p>,
});

const Leaf = ({ attributes, children, leaf, readOnly }) => {
  if (leaf.bold) children = <strong>{children}</strong>;

  if (leaf.code) children = <code>{children}</code>;

  if (leaf.italic) children = <em>{children}</em>;

  if (leaf.underline) children = <u>{children}</u>;

  if (leaf.math_inline) {
    if (readOnly) {
      children = (
        <Suspense fallback={children.props.text.text}>
          <TeX math={children.props.text.text} />
        </Suspense>
      );
    } else {
      children = <span className="math-inline bg-gray-300">{children}</span>;
    }
  }

  if (leaf.cloze)
    children = <ClozeComponent revealAnswer={true}>{children}</ClozeComponent>;

  return <span {...attributes}>{children}</span>;
};

export default Leaf;
