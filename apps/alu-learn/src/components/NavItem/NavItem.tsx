import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

interface NavItemProps {
  /**
   * Font Awesome icon to display
   */
  icon: IconProp;
  /**
   * Where the navitem leads to
   */
  href: string;
  /**
   * Text to display in the navitem
   */
  children: string;
}

/**
 * Displays a clickable link in the navbar
 */
export default function NavItem({ icon, href, children }: NavItemProps) {
  return (
    <Link
      href={href}
      className="
      items-center justify-center rounded-full bg-white bg-opacity-0
      px-4 py-3 text-white
      text-opacity-60 hover:bg-opacity-20 hover:text-opacity-100
      lg:inline-flex lg:w-auto transition"
    >
      <FontAwesomeIcon icon={icon} />
      <span className="ml-1">{children}</span>
    </Link>
  );
}
