import NavItem from "@/components/NavItem";
import type { Streak } from "@/types";
import {
  faBars,
  faCompass,
  faStar,
  faInfoCircle,
  faRobot,
  faCrown,
  faMarker,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

// These are dynamic as they are only shown to users who are not signed in
const SignedIn = dynamic(() => import("./SignedIn"));
const SignedOut = dynamic(() => import("./SignedOut"));

interface NavbarProps {
  session: Session | null;
  status: "authenticated" | "unauthenticated" | "loading";
  isPro: boolean;
  streak?: Streak;
}

/**
 * Render a navbar
 */
export default function Navbar({
  session,
  status,
  isPro,
  streak,
}: NavbarProps) {
  const [expandedMenu, setExpandedMenu] = useState(false);

  const congratulationsMessage = (() => {
    let text: string;
    switch (streak?.currentStreak) {
      case 7:
        text = "A one-week streak! (hey, that rhymes)";
        break;
      case 10:
        text = "Congratulations on a 10 day streak!";
        break;
      case 30:
        text = "Congratulations on a month-long streak!";
        break;
      case 42:
        text = "The answer to life, the universe, and everything";
        break;
      case 50:
        text = "Half-way to 100 days!  Congratulations!";
        break;
      case 75:
        text = "¾!";
        break;
      case 100:
        text = "CONGRATULATIONS ON 100 DAYS OF ALU!!!";
        break;
      case 111:
        text = "You are eleventy-one today! (or at least your streak is)";
        break;
      case 128:
        text = "2^7";
        break;
      case 200:
        text = "20 0(00) days under the flashcards";
        break;
      case 250:
        text = "250 DAYS! YOU'RE AMAZING!";
        break;
      case 365:
        text = "A WHOLE YEAR OF ALU!  AMAZING!";
        break;
      case 500:
        text = "500 DAYS!  HALF-WAY TO FOUR DIGITS!  YOU'RE AMAZING!";
        break;
      case 666:
        text = "I'd be careful about this streak number...";
        break;
      case 1000:
        text = "1000 DAYS!  4 DIGITS!  THANK YOU FOR BEING A PART OF ALU!";
        break;
      default:
        text = "";
        break;
    }
    return (
      text && (
        <span className="text-white text-opacity-60 items-center justify-center inline-flex overflow-ellipsis">
          <FontAwesomeIcon icon={faCrown} className="mr-1" />
          {text}
        </span>
      )
    );
  })();

  return (
    <nav
      className="
      fixed top-0 left-0 z-50 flex w-screen
      flex-wrap items-center bg-alu-dark-purple p-4 shadow-lg"
    >
      <Link
        href={session ? "/home" : "/"}
        className="mr-2 inline-flex items-center p-2"
      >
        <div className="flex items-center">
          <span className="transition duration-500 hover:scale-x-[-1] mt-1">
            <Image
              src="/assets/logo.svg"
              alt="Alu Learn Logo"
              height={40}
              width={40}
            />
          </span>
          <span className="ml-2 text-2xl font-bold text-white no-underline">
            Alu Learn
          </span>
          {isPro && (
            <span className="hover:rotate-360 transition duration-700 h-[25px]">
              <Image
                src="/assets/pro-banner.svg"
                alt="Pro Banner"
                className="ml-1 -translate-y-0.5 w-14"
                width={60}
                height={25}
              />
            </span>
          )}
        </div>
      </Link>
      <button
        className="
          ml-auto inline-flex rounded-full bg-white bg-opacity-0
          p-3 text-white hover:bg-opacity-20 lg:hidden
        "
        onClick={() => setExpandedMenu(!expandedMenu)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      <div
        className={
          "ml-5 w-full lg:inline-flex lg:w-auto lg:flex-grow" +
          (expandedMenu ? " block" : " hidden")
        }
        id="navigation"
      >
        <div className="flex flex-grow flex-col lg:inline-flex lg:flex-row">
          <NavItem href="/explore" icon={faCompass}>
            Explore
          </NavItem>
          <NavItem href="/pro" icon={faStar}>
            Pro
          </NavItem>
          <NavItem href="/about" icon={faInfoCircle}>
            About
          </NavItem>
          <NavItem href="/auto-flashcards" icon={faRobot}>
            Auto Flashcards
          </NavItem>
          <NavItem href="/auto-grader" icon={faMarker}>
            Auto Grader
          </NavItem>
          {congratulationsMessage}

          {status === "authenticated" && session !== null && (
            <SignedIn session={session} streak={streak} />
          )}
          {status === "unauthenticated" && <SignedOut />}
        </div>
      </div>
    </nav>
  );
}
