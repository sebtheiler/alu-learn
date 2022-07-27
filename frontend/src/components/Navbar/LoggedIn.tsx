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
import Dropdown from "components/Dropdown";
import Jdenticon from "components/Jdenticon";

const profileDropdownOptions = [
  { text: "My Profile", href: "/profile", faIcon: faUserCircle },
  { text: "Settings", href: "/settings", faIcon: faCogs },
  { text: "Notifications", href: "/notifications", faIcon: faBell },
  { divider: true },
  { text: "Changelog", href: "/changelog", faIcon: faBook },
  { text: "Log-out", href: "/logout", faIcon: faSignOut },
  { text: "Contact Us", href: "/contactus", faIcon: faEnvelope },
];

interface LoggedInProps {
  username: string;
  streak: {
    currentStreak: number;
    doneReviewsToday: boolean;
  };
}

export default function LoggedIn({ username, streak }: LoggedInProps) {
  return (
    <div className="ml-auto">
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
      <div className="inline-flex items-center justify-center px-3 py-2">
        <Dropdown options={profileDropdownOptions}>
          <Jdenticon
            value={username}
            size={32}
            className="absolute top-0 right-0 mt-3 mr-6 h-12 w-12 rounded-full bg-white
                     bg-opacity-5 p-1 hover:bg-opacity-10"
          />
        </Dropdown>
      </div>
    </div>
  );
}
