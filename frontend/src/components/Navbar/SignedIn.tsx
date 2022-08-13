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
import Dropdown from "atoms/Dropdown";
import type { MenuOption } from "atoms/Dropdown/Dropdown";
import Jdenticon from "components/Jdenticon";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import type { Streak } from "types";

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
  { text: "Contact Us", href: "/contactus", faIcon: faEnvelope },
] as MenuOption[];

interface SignedInProps {
  session: Session;
  streak: Streak;
}

export default function SignedIn({ session, streak }: SignedInProps) {
  return (
    <div className="ml-auto inline-flex items-center">
      <div className="mr-12 inline-flex items-center justify-center px-3 py-2">
        <FontAwesomeIcon
          icon={faFire}
          size="2x"
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
      <div className="inline-flex items-center justify-center mx-3">
        <Dropdown options={profileDropdownOptions}>
          {session?.user?.image ? (
            <span className="h-12 w-12 absolute top-0 right-0 mt-4 mr-6 rounded-full bg-white bg-opacity-5 justify-center hover:bg-opacity-10 inline-flex items-center">
              <Image
                src={session.user.image}
                width={40}
                height={40}
                alt="Your profile picture"
                className="rounded-full"
              />
            </span>
          ) : (
            <Jdenticon
              value={session?.user?.email ?? ""}
              size={32}
              className="absolute top-0 right-0 mt-4 mr-6 h-12 w-12 rounded-full bg-white bg-opacity-5 p-1 hover:bg-opacity-10"
            />
          )}
        </Dropdown>
      </div>
    </div>
  );
}
