import classNames from "@/helpers/classNames";
import useProStore from "@/stores/proStore";
import { useState, useEffect, useMemo } from "react";

interface AdProps {
  /**
   * Ad to display
   */
  adType:
    | "META_SIDEBAR"
    | "FINISHED_STUDYING_1"
    | "FINISHED_STUDYING_2"
    | "COURSE_BOTTOM"
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
  ["FLASHCARD_LIST_MIDDLE", { format: "feed", slot: "5305250964" }],
  ["FLASHCARD_LIST_BOTTOM", { format: "display", slot: "2850440020" }],
]);

/**
 * Displays an Ad
 */
export default function Ad({ adType, className }: AdProps) {
  const isPro = useProStore((state) => state.isPro);

  const ad = useMemo(() => adSlots.get(adType), [adType]);
  const [pushedAdEl, setPushedAdEl] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (pushedAdEl || isPro || !ad) return;
    setPushedAdEl(true);
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, [pushedAdEl, isPro, ad]);

  if (ad && isPro === false && mounted) {
    return (
      <div
        className={classNames(
          "my-3 mx-auto overflow-hidden",
          process.env.NODE_ENV === "development" && "border-2 border-red-500",
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
          />
        )}
      </div>
    );
  }

  return null;
}
