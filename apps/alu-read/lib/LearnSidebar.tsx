import AsyncButton from "alu-ui/src/AsyncButton";
import TextInput from "alu-ui/src/TextInput";
import classNames from "helpers-lib/src/classNames";
import { useCallback, useContext, useEffect, useState } from "react";
import calcNextObjectInterval from "../src/server/calcNextObjectInterval";
import useGetObject from "../helpers/useGetObject";
import { GlobalContext } from "../src/app/globalContext";
import { trpcNonReact } from "../src/app/util";
import matchesShortcut from "../keyboardShortcuts";

const LearnSidebar: React.FC = () => {
  const { setSelectedObject } = useContext(GlobalContext);
  const object = useGetObject();
  const [nextReviewInDays, setNextReviewInDays] = useState(0);
  const [priority, setPriority] = useState<number | null>(1);

  const learnNext = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      const nextObject = await trpcNonReact.learn.nextObject.mutate({
        currentObjectId: object?.id ?? null,
        currentObjectType: object?.objectType ?? null,
        nextReviewInDays,
        priority,
        // aFactor,
      });
      setSelectedObject(nextObject);

      setNextReviewInDays(calcNextObjectInterval(nextObject));
    },
    [nextReviewInDays, priority, object, setSelectedObject]
  );

  useEffect(() => {
    if (object) {
      setNextReviewInDays(calcNextObjectInterval(object));
      setPriority(object.priority);
    }
  }, [object]);

  // Ctrl/cmd+L to learn the next item
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (matchesShortcut("learnNext", event)) {
        learnNext();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [learnNext]);

  return (
    <div className="p-3 w-full h-full bg-stone-50 border-l-4 border-l-stone-200 sticky top-0">
      <br />
      {object?.objectType === "ARTICLE" ? (
        <div>
          {object.originUrl ? (
            <a href={object.originUrl} target="_blank" rel="noreferrer">
              <h1
                className={classNames(
                  "text-2xl",
                  object.originUrl && "text-blue-500 underline"
                )}
              >
                {object.title}
              </h1>
            </a>
          ) : (
            <h1 className="text-2xl">{object.title}</h1>
          )}
          <h3 className="text-gray-600 italic text-xl">{object.byline}</h3>
        </div>
      ) : (
        <div>
          {/* @ts-ignore */}
          {object?.parentArticle && (
            <h1 className="text-2xl mb-2">
              {/* @ts-ignore */}
              Parent: {object?.parentArticle?.title}
            </h1>
          )}
        </div>
      )}
      {object && (
        <div>
          <p>Imported on: {new Date(object.createdAt).toLocaleDateString()}</p>
          <p>
            Last review:{" "}
            {object.lastReview
              ? new Date(object.lastReview).toLocaleDateString()
              : "never"}
          </p>
          <p>Priority: {object.priority}</p>
          <p>A-Factor: {object.aFactor}</p>
          <hr className="my-5" />
          <TextInput
            label="Review in (days)"
            type="number"
            value={nextReviewInDays}
            onChange={(e) => setNextReviewInDays(parseInt(e.target.value))}
            required
          />
          <TextInput
            label="Priority"
            min={1}
            className="my-1"
            type="number"
            value={priority ?? undefined}
            onChange={(e) => setPriority(parseInt(e.target.value))}
          />
        </div>
      )}
      <AsyncButton onClick={learnNext} block>
        Learn Next
      </AsyncButton>
    </div>
  );
};

export default LearnSidebar;
