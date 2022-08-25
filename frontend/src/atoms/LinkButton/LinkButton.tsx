import Button from "atoms/Button";
import type { ButtonProps } from "atoms/Button";
import Link from "next/link";

interface LinkButtonProps extends ButtonProps {
  /**
   * Href the button will link to
   */
  href: string;
}

/**
 * Creates a link wrapping a button
 * Formerly created a link styled as a button, although this was dropped
 * @note It is technically undefined behavior to have a button as a child of an anchor, but it works fine
 */
export default function LinkButton(props: LinkButtonProps) {
  return (
    <Link href={props.href}>
      <a>
        <Button {...props} />
      </a>
    </Link>
  );
}
