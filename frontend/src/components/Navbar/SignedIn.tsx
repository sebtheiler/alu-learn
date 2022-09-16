import Dropdown from "@/atoms/Dropdown";
import type { MenuOption } from "@/atoms/Dropdown/Dropdown";
import type { Streak } from "@/types";
import {
  faBell,
  faBook,
  faCogs,
  faEnvelope,
  faSignOut,
  faUserCircle,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";

const profileDropdownOptions = [
  { text: "My Profile", href: "/profile", faIcon: faUserCircle },
  { text: "Settings", href: "/settings", faIcon: faCogs },
  { text: "Notifications", href: "/notifications", faIcon: faBell },
  { divider: true },
  { text: "Changelog", href: "/changelog", faIcon: faBook },
  {
    text: "Log-out",
    href: "/",
    faIcon: faSignOut,
    onClick: () => signOut({ callbackUrl: "/" }),
  },
  {
    text: "Contact Us",
    href: "mailto:support@alulearn.com",
    faIcon: faEnvelope,
  },
] as MenuOption[];

interface SignedInProps {
  session: Session;
  streak?: Streak;
}

export default function SignedIn({ session, streak }: SignedInProps) {
  return (
    <div className="ml-auto inline-flex items-center">
      {streak && (
        <div className="mr-12 inline-flex items-center justify-center px-3 py-2">
          <FontAwesomeIcon
            icon={faFire}
            size="3x"
            className={
              "absolute h-10 w-10" +
              (streak.doneReviewsToday
                ? " text-alu-streak-lit"
                : " text-alu-streak-unlit")
            }
          />
          <p
            className="mx-auto h-6 w-6 rounded-full text-center"
            style={{
              background: streak.doneReviewsToday ? "#fd9626" : "#e5e5e5",
              color: streak.doneReviewsToday ? "white" : "black",
              fontSize: streak.currentStreak < 100 ? "16px" : "15px",
              transform: "translateY(3px)",
            }}
          >
            {streak.currentStreak}
          </p>
        </div>
      )}
      <div className="inline-flex items-center justify-center mt-2 mr-8">
        <Dropdown options={profileDropdownOptions}>
          <Image
            src={session?.user?.image ?? "/assets/default-profile-picture.jpg"}
            width={40}
            height={40}
            alt="Your profile picture"
            className="rounded-full"
          />
        </Dropdown>
      </div>
    </div>
  );
}
