import classNames from "helpers-lib/src/classNames";
import useProStore from "@/stores/proStore";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";

interface AdProps {
  /**
   * Ad to display
   */
  adType:
    | "META_SIDEBAR"
    | "FINISHED_STUDYING_1"
    | "FINISHED_STUDYING_2"
    | "COURSE_BOTTOM"
    | "COURSE_SIDEBAR"
    | "FLASHCARD_LIST_MIDDLE"
    | "FLASHCARD_LIST_BOTTOM";
  /**
   * Additional classnames to apply
   */
  className?: string;
}

const adSlots = new Map<
  AdProps["adType"],
  { format: "display" | "feed"; slot: string }
>([
  ["META_SIDEBAR", { format: "display", slot: "5982440524" }],
  ["FINISHED_STUDYING_1", { format: "display", slot: "5954520366" }],
  ["FINISHED_STUDYING_2", { format: "display", slot: "1728930040" }],
  ["COURSE_BOTTOM", { format: "display", slot: "2309769570" }],
  ["COURSE_SIDEBAR", { format: "display", slot: "2104655363" }],
  ["FLASHCARD_LIST_MIDDLE", { format: "feed", slot: "5305250964" }],
  ["FLASHCARD_LIST_BOTTOM", { format: "display", slot: "2850440020" }],
]);

/**
 * Displays an Ad
 */
export default function Ad({ adType, className }: AdProps) {
  const isPro = useProStore((state) => state.isPro);
  const session = useSession();
  const [pushedAd, setPushedAd] = useState(false);

  const ad = useMemo(() => adSlots.get(adType), [adType]);
  const showAd = useMemo(
    () =>
      process.env.NODE_ENV === "production" &&
      ad &&
      ((session.status === "authenticated" && isPro === false) ||
        (session.status === "unauthenticated" && isPro === null)),
    [ad, isPro, session.status]
  );

  // If the ad has no height (it is not displayed), assume the user is running adblock
  const adElRef = useRef<HTMLModElement | null>(null);
  const [adBlockDetected, setAdBlockDetected] = useState(false);
  useMemo(() => {
    // Wait two seconds for the ad to load
    (async () => {
      await new Promise((r) => setTimeout(r, 2000));
      setAdBlockDetected(
        isPro === false && adElRef.current?.offsetHeight === 0
      );
    })();
  }, [isPro]);

  // Taken from https://stackoverflow.com/a/69374914/10226703
  useEffect(() => {
    if (!showAd || pushedAd) return;
    const pushAd = () => {
      try {
        // @ts-ignore
        const adsbygoogle = window.adsbygoogle;
        adsbygoogle.push({});
        setPushedAd(true);
      } catch (e) {
        console.error(e);
      }
    };

    const interval = setInterval(() => {
      // Check if Adsense script is loaded every 300ms
      // @ts-ignore
      if (window.adsbygoogle) {
        pushAd();
        // clear the interval once the ad is pushed so that function isn't called indefinitely
        clearInterval(interval);
      }
    }, 300);

    return () => {
      clearInterval(interval);
    };
  }, [showAd, pushedAd]);

  if (ad && showAd) {
    return (
      <div
        className={classNames(
          "my-3 mx-auto overflow-hidden",
          process.env.NODE_ENV === "development" &&
            !adBlockDetected &&
            "border-2 border-red-500",
          adBlockDetected &&
            "border-4 border-gray-200 bg-gray-50 rounded-xl p-2",
          className
        )}
      >
        {ad.format === "display" && (
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-8039497825015260"
            data-ad-slot={ad.slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-adtest={process.env.NODE_ENV === "production" ? "off" : "on"}
            ref={adElRef}
          />
        )}
        {ad.format === "feed" && (
          <ins
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-format="fluid"
            data-ad-layout-key="-fb+5w+4e-db+86"
            data-ad-client="ca-pub-8039497825015260"
            data-ad-slot={ad.slot}
            ref={adElRef}
          />
        )}
        {adBlockDetected && (
          <p className="text-center">
            It looks like you&apos;re using an ad-blocker :&#40;
            <br />
            <br />
            I&apos;m personally funding Alu, and ads help cover some of the
            server costs. Please consider disabling ad-block or upgrading to{" "}
            <Link href="/pro" className="text-blue-600">
              pro
            </Link>{" "}
            to support Alu.
          </p>
        )}
      </div>
    );
  }

  return null;
}
