import Button from "@/atoms/Button";
import SEO from "@/helpers/SEO";
import classNames from "@/helpers/classNames";
import LexicalEditor from "@/lexicalEditor/LexicalEditor";
import type { ReviewInstanceWithFlashcard } from "@/types";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

interface GridValue {
  field: string;
  id: string;
}

interface GridSelection {
  i: number;
  j: number;
}

export interface MatchingGridGamePageProps {
  reviewInstances: ReviewInstanceWithFlashcard[];
}

/**
 * A game where you match fronts and backs in a grid
 */
export default function MatchingGridGamePage({
  reviewInstances,
}: MatchingGridGamePageProps) {
  const router = useRouter();
  const { courseId } = router.query;
  const gridSize = parseInt(router.query.gridSize as string);
  const [correctValues, setCorrectValues] = useState<string[]>([]);
  const [numMistakes, setNumMistakes] = useState(0);

  const values = useMemo(() => {
    const values: GridValue[] = [];
    for (const reviewInstance of reviewInstances) {
      values.push({
        field: JSON.stringify(
          JSON.parse(reviewInstance.flashcard.fields as string)[0]
        ),
        id: reviewInstance.id,
      });
      values.push({
        field: JSON.stringify(
          JSON.parse(reviewInstance.flashcard.fields as string)[1]
        ),
        id: reviewInstance.id,
      });
    }

    return values.sort(() => Math.random() - 0.5);
  }, [reviewInstances]);
  const [selected, setSelected] = useState<GridSelection | null>(null);

  const selectGrid = ({ i, j }: GridSelection) => {
    const newEl = values[i * gridSize + j].id;

    if (correctValues.includes(newEl)) {
      return;
    } else if (!selected) {
      setSelected({ i, j });
      return;
    } else if (selected.i === i && selected.j === j) {
      setSelected(null);
      return;
    }

    const selectedEl = values[selected.i * gridSize + selected.j].id;
    if (selectedEl === newEl) {
      setCorrectValues([...correctValues, newEl]);
      setSelected(null);

      // https://freesound.org/people/ertfelda/sounds/243701/
      const sound = new Audio("/assets/audio/correct.wav");
      sound.play();
    } else {
      setSelected(null);
      setNumMistakes(numMistakes + 1);
    }
  };

  const playAgain = () => {
    setNumMistakes(0);
    setSelected(null);
    setCorrectValues([]);
    router.replace(router.asPath);
  };

  const finishedPlaying = correctValues.length === gridSize ** 2 / 2;

  return (
    <>
      <SEO
        title="Matching Grid Game"
        path={`course/${courseId}/games/matching-grid`}
        description=""
      />
      <div className="mt-28">
        <h1 className="font-bold text-2xl text-center">
          Match the Fronts and Backs
        </h1>
        {!finishedPlaying && values.length === gridSize ** 2 ? (
          <div className="flex flex-wrap justify-center">
            {[...Array(gridSize)].map((_, i) => (
              <div key={i}>
                {[...Array(gridSize)].map((_, j) => (
                  <div
                    key={j}
                    className={classNames(
                      "w-40 h-40 m-4 rounded-xl border-4 border-blue-700 flex items-center justify-center hover:scale-105 hover:cursor-pointer transition",
                      selected?.i === i && selected?.j === j
                        ? "bg-slate-200"
                        : correctValues.includes(values[i * gridSize + j].id)
                        ? "bg-green-300 hover:cursor-not-allowed hover:scale-100 pop"
                        : "bg-slate-50"
                    )}
                    onClick={() => selectGrid({ i, j })}
                  >
                    <LexicalEditor
                      namespace={`grid-${i}-${j}`}
                      editorState={values[i * gridSize + j].field}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-10">
            {finishedPlaying ? (
              <>
                <p>Awesome work!</p>
                {numMistakes > 0 ? (
                  <p>You made {numMistakes} mistakes</p>
                ) : (
                  <p>You didn&apos;t make any mistakes!</p>
                )}
                <Button onClick={playAgain} className="mt-2">
                  Play Again
                </Button>
              </>
            ) : (
              <p>You don&apos;t have enough flashcards to play this game</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
