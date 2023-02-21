import type { HistorySegment } from "@prisma/client";
import { useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import ReactTooltip from "react-tooltip";

interface HistoryVal {
  date: string;
  count: number;
  reviewsStudied: number;
  timeTaken: number;
}

const genDataTip = (value: HistoryVal) => {
  if (!value) return;
  const minutes = Math.round(value.timeTaken / 1000 / 60);
  return `You studied ${value.reviewsStudied} flashcard${
    value.reviewsStudied !== 1 ? "s" : ""
  } in ${
    minutes > 0
      ? `${minutes} minute${minutes !== 1 ? "s" : ""}`
      : "less than a minute"
  }`;
};

// NOTE: This will need to be replaced by https://cal-heatmap.com/ unless
// `react-calendar-heatmap` starts receiving updates again
export default function Heatmap({ history }: { history: HistorySegment[] }) {
  const historyVals = useMemo<HistoryVal[]>(
    () =>
      history
        .sort(
          (a, b) => new Date(a?.date).getTime() - new Date(b?.date).getTime()
        )
        .map((historySegment) => ({
          date: (historySegment?.date as unknown as string).slice(0, 10),
          count: historySegment.reviewsStudied,
          reviewsStudied: historySegment.reviewsStudied,
          timeTaken: historySegment.timeTaken,
        })),
    [history]
  );
  const maxValue = useMemo(
    () => Math.max(...historyVals.map((h) => h.count)),
    [historyVals]
  );

  // Workaround for https://github.com/wwayne/react-tooltip/issues/769
  const [showTooltip, setShowTooltip] = useState(false);

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const todayDataTip =
    historyVals.length > 0 &&
    historyVals[historyVals.length - 1]?.date ===
      new Date().toISOString().slice(0, 10) &&
    genDataTip(historyVals[historyVals.length - 1]);

  return (
    <div className="max-w-lg mx-auto">
      <div
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <CalendarHeatmap
          startDate={startDate}
          endDate={new Date()}
          values={historyVals}
          classForValue={(value: HistoryVal) => {
            if (!value) return "heatmapColorScale0";
            const colorNum = Math.ceil((value.count / maxValue) * 9);
            return `heatmapColorScale${colorNum}`;
          }}
          tooltipDataAttrs={(value: HistoryVal) => {
            if (!value?.date) return;
            return {
              "data-tip": `${genDataTip(value)} on ${new Date(value.date)
                .toDateString()
                .slice(0, 10)}`,
            };
          }}
        />
      </div>
      {showTooltip && <ReactTooltip />}
      <div>
        <p className="text-center mt-2">
          {todayDataTip ? (
            <>{todayDataTip} today</>
          ) : (
            "You haven't studied any flashcards today"
          )}
        </p>
      </div>
    </div>
  );
}
