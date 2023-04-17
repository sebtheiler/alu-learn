import Button from "alu-ui/src/Button";
import Checkbox from "alu-ui/src/Checkbox";
import DisplayUserInline from "@/components/DisplayUserInline";
import SEO from "@/helpers/SEO";
import formatTimeTaken from "helpers-lib/src/formatTimeTaken";
import { GeneratedFlashcard } from "@/types";
import type { AutoFlashcardsGeneration, HistorySegment } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

export interface DateData {
  date: string;
  num: number;
}

export interface AdminPageProps {
  totalNumberOfUsers: number;
  numSignUpsInPastWeek: number;
  signUpData: DateData[];
  numVisitsToday: number;
  numVisitsInTheWeek: number;
  numWeeklyActiveUsers: number;
  avgDailyActiveUsers: number;
  visitsData: DateData[];
  numUsersStudiedFlashcardsToday: number;
  numUsersStudiedFlashcardsThisWeek: number;
  numFlashcardsStudiedToday: number;
  numFlashcardsStudiedThisWeek: number;
  timeStudiedToday: number;
  timeStudiedThisWeek: number;
  numFlashcardsCreatedThisWeek: number;
  flashcardsStudiedData: DateData[];
  historySegmentsToday: HistorySegment[];
  autoFlashcardsGenerated: AutoFlashcardsGeneration[];
}

/**
 * Basic admin page for staff
 */
export default function AdminPage({
  totalNumberOfUsers,
  numSignUpsInPastWeek,
  signUpData,
  numVisitsInTheWeek,
  numVisitsToday,
  numWeeklyActiveUsers,
  avgDailyActiveUsers,
  visitsData,
  numUsersStudiedFlashcardsToday,
  numUsersStudiedFlashcardsThisWeek,
  numFlashcardsStudiedToday,
  numFlashcardsStudiedThisWeek,
  timeStudiedToday,
  timeStudiedThisWeek,
  numFlashcardsCreatedThisWeek,
  flashcardsStudiedData,
  historySegmentsToday,
  autoFlashcardsGenerated,
}: AdminPageProps) {
  const isServerSide = typeof window === "undefined";

  const router = useRouter();
  const nonWESSOnly = router.query.nonWESSOnly === "true";

  return (
    <>
      <SEO title="Admin" path="/admin" noindex />
      <div className="mt-28">
        <h1 className="text-center text-4xl font-bold">Admin Page</h1>
        <div className="mx-auto max-w-4xl px-5">
          <Checkbox
            label="Non-WESS users only?"
            defaultChecked={nonWESSOnly}
            onChange={() =>
              nonWESSOnly
                ? router.back()
                : router.push({
                    pathname: router.asPath,
                    query: {
                      nonWESSOnly: "true",
                    },
                  })
            }
            className="mb-10"
          />
          <div>
            <h2 className="font-bold text-2xl">Sign-ups</h2>
            <p>Total number of users: {totalNumberOfUsers}</p>
            <p>Number of sign-ups in past week: {numSignUpsInPastWeek}</p>
            <p className="font-bold mt-2">Daily Sign-ups</p>
            {!isServerSide && (
              <LineChart
                width={500}
                height={300}
                data={signUpData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="num" stroke="#8884d8" />
              </LineChart>
            )}
          </div>
          <div>
            <h2 className="font-bold text-2xl mt-5">User Activity</h2>
            <p>WAUs: {numWeeklyActiveUsers}</p>
            <p>Average DAUs in the past week: {avgDailyActiveUsers}</p>
            <p>Number of visits today: {numVisitsToday}</p>
            <p>Number of visits in the past week: {numVisitsInTheWeek}</p>
            <p>
              <Link
                href="/admin/retention"
                target="_blank"
                className="text-blue-500"
              >
                Weekly user retention rate
              </Link>
            </p>
            <p className="font-bold mt-2">DAUs</p>
            {!isServerSide && (
              <LineChart
                width={500}
                height={300}
                data={visitsData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="num" stroke="#8884d8" />
              </LineChart>
            )}
          </div>
          <div>
            <h2 className="font-bold text-2xl mt-5">Flashcard Activity</h2>
            <p>
              Number of users who have studied flashcards today:{" "}
              {numUsersStudiedFlashcardsToday}
            </p>
            <p>
              Number of users who have studied flashcards in the past week:{" "}
              {numUsersStudiedFlashcardsThisWeek}
            </p>
            <p>
              Number of flashcards studied today: {numFlashcardsStudiedToday}
            </p>
            <p>
              Number of flashcards studied this week:{" "}
              {numFlashcardsStudiedThisWeek}
            </p>
            <p>
              Amount of time spent today: {formatTimeTaken(timeStudiedToday)}
            </p>
            <p>
              Amount of time spent in the past week:{" "}
              {formatTimeTaken(timeStudiedThisWeek)}
            </p>
            <p>
              Number of flashcards created in the past week:{" "}
              {numFlashcardsCreatedThisWeek}
            </p>
            <p className="font-bold mt-2">Flashcards Studied</p>
            {!isServerSide && (
              <LineChart
                width={500}
                height={300}
                data={flashcardsStudiedData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="num" stroke="#8884d8" />
              </LineChart>
            )}
            <p className="font-bold mt-2">Studied Today</p>
            <div>
              {historySegmentsToday.map((historySegment) => (
                <div key={historySegment.id}>
                  {/* @ts-ignore */}
                  <DisplayUserInline user={historySegment.user} /> -{" "}
                  {historySegment.reviewsStudied} flashcards in{" "}
                  {formatTimeTaken(historySegment.timeTaken)}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-bold text-2xl mt-5">Auto Flashcards</h2>
            <div>
              {autoFlashcardsGenerated.map((autoFlashcards) => (
                <DisplayAutoFlashcardsInfo
                  key={autoFlashcards.id}
                  autoFlashcards={autoFlashcards}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DisplayAutoFlashcardsInfo({
  autoFlashcards,
}: {
  autoFlashcards: AutoFlashcardsGeneration;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      {/* @ts-ignore */}
      <DisplayUserInline user={autoFlashcards.user} /> (
      {autoFlashcards.timestamp}) -{" "}
      <p>
        <strong>Input:</strong>{" "}
        {autoFlashcards.inputText.slice(0, expanded ? undefined : 50)}...{" "}
      </p>
      {!expanded && (
        <p>
          <strong>Output:</strong> {autoFlashcards.generatedOutput.slice(0, 50)}
          ...
        </p>
      )}
      {expanded &&
        (isJsonString(autoFlashcards.generatedOutput) ? (
          JSON.parse(autoFlashcards.generatedOutput).map(
            (generatedFlashcard: GeneratedFlashcard, i: number) => (
              <div key={i} className="relative">
                <hr className="my-3" />
                <p className="font-bold">Front</p>
                <p>{generatedFlashcard.front}</p>
                <br />
                <p className="font-bold">Back</p>
                <p>{generatedFlashcard.back}</p>
              </div>
            )
          )
        ) : (
          <p className="mt-2">
            <strong>Output:</strong> {autoFlashcards.generatedOutput}
          </p>
        ))}
      <Button className="my-2" onClick={() => setExpanded(!expanded)}>
        Expand
      </Button>
      <hr className="my-3" />
    </div>
  );
}

function isJsonString(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
