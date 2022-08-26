import type { User } from "@/types";
import Image from "next/image";
import Link from "next/link";

interface DisplayUserInlineProps {
  /**
   * User to display inline
   */
  user: User;
}

/**
 * Displays a user inline, including their profile picture and a link to the user's profile
 */
export default function DisplayUserInline({ user }: DisplayUserInlineProps) {
  return (
    <span className="inline">
      <Image
        src={user.image ?? "/assets/default-profile-picture.jpg"}
        alt={`${user.name}'s profile picture`}
        width={15}
        height={15}
        className="rounded-full"
      />
      <Link href={`/users/${user.id}`}>
        <a className="inline text-blue-500 hover:text-blue-600 ml-1">
          {user.name}
        </a>
      </Link>
    </span>
  );
}
