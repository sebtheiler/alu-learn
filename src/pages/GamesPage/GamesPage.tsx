import Button from "@/atoms/Button";
import Select from "@/atoms/Select";
import TextInput from "@/atoms/TextInput";
import SEO from "@/helpers/SEO";
import { getElementsVals } from "@/helpers/getElementsVals";
import useProStore from "@/stores/proStore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

type Game = "MATCHING-GRID" | "ALU-BOT" | "QUIZ";

/**
 * Interface to select which game to play (and the settings for that game)
 */
export default function GamesPage() {
  const isPro = useProStore((state) => state.isPro);
  const [game, setGame] = useState<Game>("MATCHING-GRID");
  const [showProRequired, setShowProRequired] = useState(false);
  const router = useRouter();
  const { courseId } = router.query;

  const play = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isPro) {
      setShowProRequired(true);
      return;
    }

    const pathname = `/course/${courseId}/games/${game.toLowerCase()}`;
    const { flashcardsType } = getElementsVals(e.target as HTMLFormElement, [
      "flashcardsType",
    ]);

    switch (game) {
      case "MATCHING-GRID": {
        const { gridSize } = getElementsVals(e.target as HTMLFormElement, [
          "gridSize",
        ]);

        router.push({
          pathname,
          query: {
            flashcardsType,
            gridSize,
          },
        });
        break;
      }
      case "QUIZ": {
        const { numQuestions } = getElementsVals(e.target as HTMLFormElement, [
          "numQuestions",
        ]);

        router.push({
          pathname,
          query: {
            flashcardsType,
            numQuestions,
          },
        });
        break;
      }
      default:
        router.push(pathname);
    }
  };

  return (
    <>
      <SEO
        title="Games"
        path={`course/${courseId}/games`}
        description="Play fun games with flashcards at Alu Learn. Matching games, chatbot games, quiz games, and more are available"
      />
      <div className="mt-28 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center">
          Games {!isPro && "(Pro Only)"}
        </h1>
        {!isPro && (
          <p className="text-center mt-1 mb-3">
            Only Alu Pro users can play games with their flashcards.{" "}
            <Link href="/pro">
              <a className="text-blue-500">Start your 7-day free trial today</a>
            </Link>
            .
          </p>
        )}
        <form onSubmit={play}>
          <Select
            label="Game"
            options={[
              { value: "MATCHING-GRID", label: "Matching Grid" },
              { value: "ALU-BOT", label: "Alu Bot (WIP)" },
              { value: "QUIZ", label: "Quiz" },
            ]}
            onChange={(val) => setGame(val as Game)}
            id="game-select"
          />
          <Select
            label="Flashcards"
            options={[
              { value: "SEEN", label: "Seen Flashcards" },
              { value: "UNSEEN", label: "Unseen Flashcards" },
              { value: "ALL", label: "All Flashcards" },
            ]}
            className="my-2"
            name="flashcardsType"
            id="flashcardsType"
          />
          <hr className="my-4" />
          {game === "MATCHING-GRID" && (
            <Select
              label="Grid Size"
              options={[
                { value: 4, label: "4" },
                { value: 6, label: "6" },
                { value: 8, label: "8" },
              ]}
              id="grid-size"
              name="gridSize"
            />
          )}
          {game === "QUIZ" && (
            <TextInput
              label="Number of Questions"
              defaultValue={10}
              min={5}
              type="number"
              name="numQuestions"
            />
          )}
          <Button className="mt-4" type="submit" block>
            Play!
          </Button>
          {showProRequired && (
            <p className="text-center mt-3">
              Only Alu Pro users can play games with their flashcards.{" "}
              <Link href="/pro">
                <a className="text-blue-500">
                  Start your 7-day free trial today
                </a>
              </Link>
              .
            </p>
          )}
        </form>
      </div>
    </>
  );
}
