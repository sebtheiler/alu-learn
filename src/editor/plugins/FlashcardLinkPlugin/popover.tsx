import GetFlashcard from "@/graphql/GetFlashcard";
import LexicalEditor from "@/editor/LexicalEditor";
import type { Query, QueryGetFlashcardArgs } from "@/types";
import { useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function FlashcardLinkPopoverPlugin({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}) {
  const [activeFlashcardId, setActiveFlashcardId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const flashcardLinkEls = Array.from(
      document.querySelectorAll("[data-is-flashcard-link]")
    ) as HTMLSpanElement[];
    const eventListeners: (() => void)[][] = [];

    for (const flashcardLinkEl of flashcardLinkEls) {
      if (flashcardLinkEl.dataset.addedListener === "true") continue;
      flashcardLinkEl.dataset.addedListener = "true";

      const mouseEnterListener = () => {
        setActiveFlashcardId(flashcardLinkEl.dataset.flashcardId as string);
      };
      const mouseLeaveListener = () => {
        setActiveFlashcardId(null);
      };

      eventListeners.push([mouseEnterListener, mouseLeaveListener]);
      flashcardLinkEl.addEventListener("mouseenter", mouseEnterListener);
      flashcardLinkEl.addEventListener("mouseleave", mouseLeaveListener);
    }

    // Remove event listeners on cleanup
    return () => {
      for (let i = 0; i < flashcardLinkEls.length; i++) {
        if (!eventListeners[i]) continue;
        flashcardLinkEls[i].removeEventListener(
          "mouseenter",
          eventListeners[i][0]
        );
        flashcardLinkEls[i].removeEventListener(
          "mouseleave",
          eventListeners[i][1]
        );
        flashcardLinkEls[i].dataset.addedListener = "false";
      }
    };
  });

  return activeFlashcardId
    ? createPortal(
        <FlashcardLinkPopover activeFlashcardId={activeFlashcardId} />,
        anchorElem
      )
    : null;
}

function FlashcardLinkPopover({
  activeFlashcardId,
}: {
  activeFlashcardId: string | null;
}) {
  const { data, loading } = useQuery<
    { getFlashcard: Query["getFlashcard"] },
    QueryGetFlashcardArgs
  >(GetFlashcard, {
    variables: {
      flashcardId: activeFlashcardId as string,
    },
    skip: !activeFlashcardId,
  });
  const popupRef = useRef<HTMLDivElement | null>(null);
  const OFFSET = 20;

  useEffect(() => {
    const updatePopupPosition = (e: MouseEvent) => {
      const popupEl = popupRef.current;
      if (!popupEl || !activeFlashcardId) return;

      popupEl.style.opacity = "1";
      popupEl.style.top = `${e.clientY + window.scrollY + OFFSET}px`;
      popupEl.style.left = `${e.clientX}px`;
    };

    if (activeFlashcardId)
      window.addEventListener("mousemove", updatePopupPosition);

    return () => window.removeEventListener("mousemove", updatePopupPosition);
  });

  return (
    <div
      ref={popupRef}
      className="absolute -translate-x-1/2 z-10 max-w-xs w-full opacity-0
                 -top-[99rem] -left-[99rem] shadow-md rounded-xl transition-opacity duration-500
                 border-4 bg-alu-light-gray px-4 py-3"
    >
      <h3 className="text-center font-bold text-lg">Flashcard Preview</h3>
      {loading || !data ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="flex items-center justify-center">
            <LexicalEditor
              namespace={`flashcard-link-popover-front-${activeFlashcardId}`}
              editorState={JSON.stringify(
                JSON.parse(data?.getFlashcard?.fields as string)[0]
              )}
              disablePopovers
              readOnly
            />
          </div>
          <hr className="my-3" />
          <div className="flex items-center justify-center">
            <LexicalEditor
              namespace={`flashcard-link-popover-back-${activeFlashcardId}`}
              editorState={JSON.stringify(
                JSON.parse(data?.getFlashcard?.fields as string)[1]
              )}
              disablePopovers
              readOnly
            />
          </div>
        </div>
      )}
    </div>
  );
}
