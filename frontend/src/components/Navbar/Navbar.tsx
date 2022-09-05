import SignedIn from "./SignedIn";
import SignedOut from "./SignedOut";
import NavItem from "@/components/NavItem";
import type { Streak } from "@/types";
import {
  faBars,
  faCompass,
  faStar,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// TODO: dynamically import SignedIn and SignedOut

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
  console.log({ session, status, isPro, streak });
  const [expandedMenu, setExpandedMenu] = useState(false);

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
        <a>
          <div className="flex items-center">
            <Image
              src="/assets/logo.svg"
              alt="Alu Learn Logo"
              height={40}
              width={40}
              className="transition duration-700 hover:scale-x-[-1]"
            />
            <span className="ml-2 text-2xl font-bold text-white no-underline">
              Alu Learn
            </span>
            {isPro && (
              <Image
                src="/assets/pro-banner.svg"
                alt="Pro Banner"
                className="ml-1 -translate-y-0.5 w-14 transition duration-700 hover:rotate-360"
                width={60}
                height={25}
              />
            )}
          </div>
        </a>
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
          <NavItem href="/explore/decks" icon={faCompass}>
            Explore
          </NavItem>
          <NavItem href="/pro" icon={faStar}>
            Pro
          </NavItem>
          <NavItem href="/about" icon={faInfoCircle}>
            About
          </NavItem>

          {status === "authenticated" && session !== null && (
            <SignedIn session={session} streak={streak} />
          )}
          {status === "unauthenticated" && <SignedOut />}
        </div>
      </div>
    </nav>
  );
}
