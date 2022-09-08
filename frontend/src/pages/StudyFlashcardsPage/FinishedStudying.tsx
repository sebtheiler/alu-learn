import { useEffect, useMemo, useState } from "react";
import ReactConfetti from "react-confetti";

/**
 * Renders a series of slides that play after the user finishes studying
 */
export default function FinishedStudying() {
  const [playedSound, setPlayedSound] = useState(false);

  useEffect(() => {
    if (playedSound) return;
    setPlayedSound(true);
  }, [playedSound]);

  const slides = useMemo(() => {
    return [];
  }, []);
  console.log(slides);

  return (
    <div>
      <h1 className="text-center font-bold text-4xl">Congratulations!</h1>
      <ReactConfetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={300}
        tweenDuration={20000}
      />
    </div>
  );
}
