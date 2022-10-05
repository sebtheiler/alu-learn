import { TIME_BEFORE_SWAP } from "./helpers";
import classNames from "@/helpers/classNames";
import flattenLexical from "@/helpers/flattenLexical";
import LexicalEditor from "@/editor/LexicalEditor";
import { faStar, faVolumeHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

interface FlashcardSideProps {
  /**
   * Is this side of the flashcard the front or the back?
   */
  side: "front" | "back";
  /**
   * Flashcard field (Lexical) to display
   */
  field: string;
  /**
   * Is the side shown? The front and back sides should have opposite values
   */
  isShown: boolean;
  /**
   * Is the parent flashcard starred?
   */
  starred: boolean;
  /**
   * Called when the user clicks the "star" icon
   */
  onStarred?(event: React.MouseEvent<SVGSVGElement, MouseEvent>): void;
  /**
   * Manually override the `field` content. Only use if you know what you're doing
   */
  overrideContent?: React.ReactElement;
}

/**
 * Renders a side of a flashcard (front or back) for use in studying.
 * Both sides are rendered for the flipping animation.
 */
export default function FlashcardSide({
  side,
  field,
  isShown,
  starred,
  overrideContent,
  onStarred,
}: FlashcardSideProps) {
  const [onTop, setOnTop] = useState(isShown);

  // Delay changing the z-index of the side so that the transition does
  // not abruptly change the text
  useEffect(() => {
    setTimeout(() => setOnTop(isShown), TIME_BEFORE_SWAP); // magic number to hide swap
  }, [isShown]);

  const [playingTTS, setPlayingTTS] = useState(false);

  const playTTS = async (e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();
    if (!("speechSynthesis" in window)) return;
    const synthesis = window.speechSynthesis;

    if (playingTTS) {
      synthesis.cancel();
    } else {
      const text = await flattenLexical(field);
      if (text) {
        setPlayingTTS(true);
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = text;
        synthesis.speak(utterance);
        utterance.onend = () => setPlayingTTS(false);
      }
    }
  };

  return (
    <div
      className={classNames(
        "absolute w-full h-full bg-white transition-transform duration-700 rounded-xl border-2 border-gray-200 hover:shadow-lg",
        onTop ? "z-10" : "-z-10"
      )}
      style={{ transform: isShown ? "" : "rotateY(180deg)" }}
    >
      <div className="absolute w-full">
        <p className="text-center my-2 text-gray-400 font-bold">
          {side.toUpperCase()}
          <FontAwesomeIcon
            icon={faVolumeHigh}
            className="absolute right-10 top-3 z-20"
            onClick={playTTS}
            title={playingTTS ? "Click to Cancel" : "Speak Flashcard (en)"}
            role="button"
            beat={playingTTS}
          />
          <FontAwesomeIcon
            icon={faStar}
            className={classNames(
              "absolute right-3 top-3 z-20",
              starred && "text-yellow-500"
            )}
            title={starred ? "Unstar Flashcard" : "Star Flashcard"}
            onClick={onStarred}
            role="button"
          />
        </p>
        <hr className="mx-5" />
      </div>
      <div className="flex flex-1 justify-center items-center w-full h-full relative p-5">
        {overrideContent ? (
          overrideContent
        ) : (
          <LexicalEditor
            namespace={`flashcard-${side}`}
            editorState={field}
            readOnly
          />
        )}
      </div>
    </div>
  );
}
