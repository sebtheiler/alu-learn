import { Fragment } from "react";

interface CardsDoneSVGProps {
  /**
   * What is the user's target number of cards to study?
   */
  targetReviewsDone: number;
  /**
   * How many cards has the user studied this day?
   */
  reviewsDone: number;
  /**
   * How many cards has the user just studied? (for use after a user finishes studying more cards)
   */
  reviewsJustDone?: number;
}

/**
 * Displays an SVG with a visual of how many cards the user has studied
 */
export default function ReviewsDoneSVG({
  targetReviewsDone,
  reviewsDone,
  reviewsJustDone = 0,
}: CardsDoneSVGProps) {
  const LINE_TICK_INTERVAL = reviewsDone > 200 ? 20 : 10;
  const NUM_EXTRA_BARS = Math.floor(
    (Math.max(reviewsDone, targetReviewsDone) - targetReviewsDone) /
      LINE_TICK_INTERVAL +
      2
  );
  const DIV_HEIGHT = 400;
  const DIV_WIDTH = 300;
  const DIV_BORDER_THICKNESS = 4;
  const SVG_HEIGHT = DIV_HEIGHT - DIV_BORDER_THICKNESS * 2;
  const SVG_WIDTH = DIV_WIDTH - DIV_BORDER_THICKNESS * 2;
  const LINE_TICK_OFFSET = 40;
  const BAR_WIDTH = 100;
  const NUMBER_COLOR = "#d9d9d9";
  const TARGET_COLOR = "#d52b2c";
  const LINE_TICK_COLOR = "#a3a3a3";

  const calcY = (i: number) =>
    DIV_HEIGHT -
    30 -
    i * ((DIV_HEIGHT - 20) / lineTickIntervalRange.length) +
    5;
  const lineTickIntervalRange = Array.from(
    Array(
      Math.floor(targetReviewsDone / LINE_TICK_INTERVAL) + NUM_EXTRA_BARS + 1
    ).keys()
  );
  const lineTickYVals = lineTickIntervalRange.map((i) => ({
    i: i,
    y: calcY(i),
    val: i * LINE_TICK_INTERVAL,
  }));

  return (
    <div
      className="mx-auto border-gray-200 border-4 bg-gray-50 rounded-xl"
      style={{ height: DIV_HEIGHT, maxWidth: DIV_WIDTH }}
    >
      <svg width="100%" height="100%">
        {/* Chart y-axis and bars */}
        {lineTickYVals.map((lineTickYVal) => {
          return (
            <Fragment key={lineTickYVal.val}>
              <line
                x1={LINE_TICK_OFFSET}
                y1={lineTickYVal.y - 5}
                x2={SVG_WIDTH - LINE_TICK_OFFSET}
                y2={lineTickYVal.y - 5}
                style={{ stroke: NUMBER_COLOR, strokeWidth: "2" }}
              />
              <text
                x="10"
                y={lineTickYVal.y}
                fill={
                  lineTickYVal.val === targetReviewsDone
                    ? TARGET_COLOR
                    : LINE_TICK_COLOR
                }
                fontWeight={
                  lineTickYVal.val === targetReviewsDone ? "bold" : "normal"
                }
              >
                {lineTickYVal.val}
              </text>
            </Fragment>
          );
        })}
        {/* Main bar, for progress */}
        <rect
          width={BAR_WIDTH}
          height={SVG_HEIGHT}
          x="50%"
          y={calcY((reviewsDone - reviewsJustDone) / LINE_TICK_INTERVAL) + 5}
          transform={`translate(-${BAR_WIDTH / 2})`}
          id="studying-target-bar"
          fill="#6a21bc"
          rx="10"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            by={`0 ${-(
              SVG_HEIGHT -
              calcY(reviewsJustDone / LINE_TICK_INTERVAL) -
              5
            )}`}
            dur="1s"
            fill="freeze"
          />
        </rect>
        {/* Target label */}
        <line
          x1={LINE_TICK_OFFSET}
          y1={calcY(targetReviewsDone / LINE_TICK_INTERVAL) - 5}
          x2={SVG_WIDTH - LINE_TICK_OFFSET}
          y2={calcY(targetReviewsDone / LINE_TICK_INTERVAL) - 5}
          style={{ stroke: TARGET_COLOR, strokeWidth: "3" }}
        />
        <rect
          width="90"
          height="25"
          x="50%"
          y={calcY(targetReviewsDone / LINE_TICK_INTERVAL) - 17.5}
          transform="translate(-45)"
          fill={TARGET_COLOR}
          rx="8"
        />
        <text
          x="50%"
          y={calcY(targetReviewsDone / LINE_TICK_INTERVAL)}
          textAnchor="middle"
          fill="white"
          fontSize="13"
        >
          DAILY GOAL
        </text>
      </svg>
    </div>
  );
}
