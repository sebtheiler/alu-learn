import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import type { IconProp } from "@fortawesome/fontawesome-svg-core";

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
    <Link href={href}>
      <a
        className="
        lg:inline-flex lg:w-auto px-4 py-3 rounded-full
        text-white text-opacity-60 hover:text-opacity-100
        bg-white bg-opacity-0 hover:bg-opacity-20
        items-center justify-center"
      >
        <FontAwesomeIcon icon={icon} />
        <span className="ml-1">{children}</span>
      </a>
    </Link>
  );
}
