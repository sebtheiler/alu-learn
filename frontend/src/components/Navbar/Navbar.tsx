import Image from "next/image";
import Link from "next/link";
import LoggedIn from "./LoggedIn";
import LoggedOut from "./LoggedOut";
import logoUrl from "assets/logo.svg";
import proBannerUrl from "assets/pro-banner.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faCompass,
  faStar,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useContext, useState } from "react";
import NavItem from "components/NavItem";
import GlobalContext from "global";

// TODO: dynamically import LoggedIn and LoggedOut

interface NavbarProps {
  /**
   * Is the user currently logged in?
   */
  isLoggedIn: boolean;
  /**
   * Information about the user's streak
   */
  streak: {
    currentStreak: number;
    doneReviewsToday: boolean;
  };
  /**
   * Username of the user (if logged in)
   */
  username: string;
  /**
   * Is the user a pro user?
   */
  isPro?: boolean;
}

/**
 * Render a navbar
 */
export default function Navbar({
  isLoggedIn,
  streak,
  username,
  isPro,
}: NavbarProps) {
  const [expandedMenu, setExpandedMenu] = useState(false);
  console.log(
    "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
    useContext(GlobalContext)
  );
  return (
    <nav
      className="
      fixed top-0 left-0 w-screen flex items-center
      bg-alu-dark-purple p-4 flex-wrap shadow-lg z-50"
    >
      <Link href="/" className="p-2 mr-2 inline-flex items-center">
        <a>
          <div className="flex items-center">
            <Image
              src={logoUrl}
              alt="Alu Learn Logo"
              height={40}
              width={40}
              className="hover:scale-x-[-1] transition duration-700"
            />
            <span className="ml-2 text-2xl font-bold text-white no-underline">
              Alu Learn
            </span>
            {isPro && (
              <img
                src={proBannerUrl}
                alt="Pro Banner"
                className="w-14 ml-1 hover:rotate-360 transition duration-700"
              />
            )}
          </div>
        </a>
      </Link>
      <button
        className="
          inline-flex p-3 bg-white text-white bg-opacity-0
          hover:bg-opacity-20 rounded-full lg:hidden ml-auto
        "
        onClick={() => setExpandedMenu(!expandedMenu)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      <div
        className={
          "w-full lg:inline-flex lg:flex-grow lg:w-auto ml-5" +
          (expandedMenu ? " block" : " hidden")
        }
        id="navigation"
      >
        <div className="lg:inline-flex lg:flex-row flex flex-col flex-grow">
          <NavItem href="/community/decks" icon={faCompass}>
            Explore
          </NavItem>
          <NavItem href="/pro" icon={faStar}>
            Pro
          </NavItem>
          <NavItem href="/about" icon={faInfoCircle}>
            About
          </NavItem>

          {isLoggedIn ? (
            <LoggedIn streak={streak} username={username} />
          ) : (
            <LoggedOut />
          )}
        </div>
      </div>
    </nav>
  );
}
