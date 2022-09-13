import { GRADES } from "../StudyFlashcardsPage/helpers";
import styles from "./AluBotGamePage.module.scss";
import StudyReviewInstance from "@/graphql/StudyReviewInstance";
import SEO from "@/helpers/SEO";
import classNames from "@/helpers/classNames";
import stringifyReviewInstanceField from "@/helpers/stringifyReviewInstanceField";
import LexicalEditor from "@/lexicalEditor/LexicalEditor";
import type {
  Intervals,
  Mutation,
  MutationStudyReviewInstanceArgs,
  ReviewInstanceWithFlashcard,
  Grade,
} from "@/types";
import { useMutation } from "@apollo/client";
import BrowserInteractionTime from "browser-interaction-time";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

const sleep = async (n: number) => new Promise((r) => setTimeout(r, n));

interface Text {
  user: "ALU" | "USER";
  content: string;
  lexical: boolean;
}

export interface AluBotGamePageProps {
  reviewInstances: ReviewInstanceWithFlashcard[];
  intervals: Intervals;
}

/**
 * Chatbot game for studying
 */
export default function AluBotGamePage({
  reviewInstances,
  intervals,
}: AluBotGamePageProps) {
  const router = useRouter();
  const { courseId } = router.query;

  const [texts, setTexts] = useState<Text[]>([]);
  const [sentInitialTexts, setSentInitialTexts] = useState(false);
  const [options, setOptions] = useState<string[] | null>(null);
  const [state, setState] = useState("START");
  const [reviewInstanceNum, setReviewInstanceNum] = useState(0);

  const [studyReviewInstance] = useMutation<
    { studyReviewInstance: Mutation["studyReviewInstance"] },
    MutationStudyReviewInstanceArgs
  >(StudyReviewInstance);

  const browserInteractionTime = useMemo(
    () =>
      new BrowserInteractionTime({
        idleTimeoutMs: 60_000,
      }),
    []
  );

  const sendText = useCallback(
    (
      user: "ALU" | "USER",
      content: string,
      textsState: Text[] | undefined = undefined,
      lexical = false
    ) => {
      const _texts = textsState ?? texts;
      const newTexts = [
        ..._texts,
        {
          user,
          content,
          lexical,
        },
      ];
      setTexts(newTexts);

      if (user === "USER") handleText(content, newTexts);

      const textsContainer = document.getElementById("textsContainer");
      if (textsContainer)
        textsContainer.scrollTop = textsContainer.scrollHeight;

      return newTexts;
    },
    // eslint-disable-next-line
    [texts]
  );

  const handleText = useCallback(
    async (text: string, textState: Text[]) => {
      await sleep(500);

      const startStudying = async (
        sendMsg = true,
        num: number = reviewInstanceNum
      ) => {
        setState("STUDYING");
        setOptions(null);
        if (sendMsg) {
          textState = sendText(
            "ALU",
            "Great! I'll show you the front of a flashcard, and you type what's on the back",
            textState
          );
        }
        await sleep(800);
        sendText(
          "ALU",
          stringifyReviewInstanceField(reviewInstances[num], 0),
          textState,
          true
        );
        browserInteractionTime.startTimer();
      };

      switch (state) {
        case "START":
          if (text === "Yes") {
            startStudying();
          } else {
            setState("WAITING");
            sendText(
              "ALU",
              "Ok then... Let me know when you're ready",
              textState
            );
            setOptions(["I'm ready"]);
          }
          break;
        case "WAITING":
          startStudying();
          break;
        case "STUDYING": {
          // Show the user the review and ask them to rate themself
          textState = sendText("ALU", "Here's the real back:", textState);
          await sleep(800);
          textState = sendText(
            "ALU",
            stringifyReviewInstanceField(reviewInstances[reviewInstanceNum], 1),
            textState,
            true
          );
          await sleep(800);
          sendText(
            "ALU",
            "How easily did you remember the flashcard?",
            textState
          );
          setState("ANSWERING");
          const grades: string[] = [];
          for (const grade of GRADES) {
            const g = intervals[reviewInstances[reviewInstanceNum].id][grade];
            if (g) grades.push(grade[0] + grade.slice(1).toLowerCase());
          }
          setOptions(grades);
          break;
        }
        case "ANSWERING": {
          // Give feedback based on how the user rates themselves
          switch (text) {
            case "Again":
              textState = sendText(
                "ALU",
                "Don't worry, you'll get it next time!",
                textState
              );
              break;
            case "Hard":
              textState = sendText("ALU", "Keep practicing!", textState);
              break;
            case "Good":
              textState = sendText("ALU", "Nice!", textState);
              break;
            case "Easy":
              textState = sendText("ALU", "Great work!", textState);
              break;
          }
          await sleep(800);

          // Get time spent
          browserInteractionTime.stopTimer();
          const timeTaken = browserInteractionTime.getTimeInMilliseconds();
          browserInteractionTime.reset();
          browserInteractionTime.startTimer();

          // Send API request
          studyReviewInstance({
            variables: {
              grade: text.toUpperCase() as Grade,
              reviewInstanceId: reviewInstances[reviewInstanceNum].id,
              timeTaken,
            },
          });

          // Show next review (or finish)
          if (reviewInstanceNum === reviewInstances.length - 1) {
            textState = sendText(
              "ALU",
              "That's all the flashcards for now, awesome work!",
              textState
            );
            setState("FINISHED");
            setOptions(["Study again"]);
          } else {
            textState = sendText("ALU", "Here's another:", textState);
            setReviewInstanceNum(reviewInstanceNum + 1);
            startStudying(false, reviewInstanceNum + 1);
          }
          break;
        }
        case "FINISHED":
          // Reset everything and start again
          router.replace(router.asPath);
          setReviewInstanceNum(0);
          setTexts([]);
          setOptions(null);
          setSentInitialTexts(false);
          setState("START");
          break;
      }
    },
    // eslint-disable-next-line
    [state, reviewInstanceNum]
  );

  useEffect(() => {
    const textsContainer = document.getElementById("textsContainer");
    if (textsContainer) textsContainer.scrollTop = textsContainer.scrollHeight;
  }, [texts]);

  useEffect(() => {
    if (sentInitialTexts) return;
    setSentInitialTexts(true);
    (async () => {
      let newTexts = sendText("ALU", "Hey!");
      await sleep(800);
      newTexts = sendText(
        "ALU",
        "I'm Alu Bot, your personal study assistant",
        newTexts
      );
      await sleep(800);
      sendText("ALU", "Are you ready to start studying?", newTexts);
      await sleep(500);

      setOptions(["Yes", "No"]);
    })();
  }, [sendText, sentInitialTexts]);
  console.log(texts);

  return (
    <>
      <SEO
        title="Alu Bot Game"
        path={`course/${courseId}/games/alu-bot`}
        description=""
      />
      <div className="mt-28">
        <h1 className="text-center font-bold text-2xl">Study with Alu Bot</h1>
        <div className="max-w-sm h-[40rem] px-5 pt-4 mx-auto md:border-2 md:border-gray-200 rounded-xl relative overflow-hidden">
          <div
            className="overflow-y-scroll h-[33rem] overflow-x-hidden px-2"
            id="textsContainer"
          >
            {texts.map((text, i) => (
              <Text text={text} texts={texts} i={i} key={i} />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-full h-10">
            {options ? (
              <div className="-translate-y-6 flex ">
                {options.map((option, i) => (
                  <div
                    key={i}
                    className="inline-block px-5 py-4 rounded-2xl bg-blue-600 text-white text-center mx-2 w-full hover:scale-105 hover:cursor-pointer transition"
                    onClick={() => sendText("USER", option)}
                    role="button"
                  >
                    {option}
                  </div>
                ))}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const messageEl = document.getElementsByName(
                    "message"
                  )[0] as HTMLInputElement;

                  sendText("USER", messageEl.value);
                  messageEl.value = "";
                }}
              >
                <input
                  placeholder="Message"
                  className="rounded-full px-2 py-1 -translate-y-2 mr-3 border-2 border-gray-300 focus:outline-none focus:border-gray-400 float-right"
                  name="message"
                  autoFocus
                />
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Text({ text, texts, i }: { text: Text; texts: Text[]; i: number }) {
  const [loading, setLoading] = useState(text.user === "ALU");
  useEffect(() => {
    if (!loading) return;
    setTimeout(() => setLoading(false), 500);
  });

  if (loading)
    return (
      <div
        className={classNames(
          styles.typingIndicator,
          "px-3 py-3 rounded-2xl bg-gray-200 mt-2"
        )}
      >
        <span />
        <span />
        <span />
      </div>
    );
  else
    return (
      <div
        className={classNames("w-full", text.user === "USER" && "text-right")}
      >
        <div
          className={classNames(
            "px-3 py-2 rounded-2xl max-w-[66.6%] inline-block text-left relative",
            text.user === "ALU"
              ? "bg-gray-200"
              : "bg-blue-600 text-white ml-auto",
            i > 0 && (texts[i - 1].user === text.user ? "mt-1" : "mt-4"),
            texts[i + 1]?.user !== text.user &&
              (text.user === "ALU" ? styles.aluBotText : styles.userText)
          )}
        >
          {text.lexical ? (
            <LexicalEditor
              namespace={`text-${i}`}
              editorState={text.content}
              readOnly
            />
          ) : (
            <p className="break-normal">{text.content}</p>
          )}
        </div>
      </div>
    );
}
