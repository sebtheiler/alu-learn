import classNames from "helpers-lib/src/classNames";
import type { TextareaHTMLAttributes } from "react";

/**
 * Display a styled text area input
 */
export default function TextArea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      className={classNames(
        "border-2 border-alu-primary-purple/20 focus:border-alu-primary-purple rounded-xl p-3 outline-none w-full resize-none transition-all mt-2",
        props.className
      )}
    />
  );
}
