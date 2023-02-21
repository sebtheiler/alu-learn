// This code is heavily adapted from https://github.com/open-spaced-repetition/fsrs4anki/blob/main/fsrs4anki_scheduler.js
/*
MIT License

Copyright (c) 2022 open-spaced-repetition

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { daysToMinutes, inDays } from "./helpers";
import calculateSM2Interval from "./sm2";
import daysBetween from "helpers-lib/src/daysBetween";
import type { GradeRating, Interval, SchedulerReviewInstance } from "@/types";

const DEFAULT_SETTINGS = {
  // `w` can be optimized via FSRS4Anki optimizer.
  w: [1, 1, 5, -0.5, -0.5, 0.2, 1.4, -0.12, 0.8, 2, -0.2, 0.2, 1],

  requestRetention: 0.9, // recommended setting: 0.8 ~ 0.9
  maximumInterval: 36500,
  easyBonus: 1.3,
  hardInterval: 1.2,
  enableFuzz: false,

  NEW_STEPS: [25, 1440], // in minutes
};

type FSRSSettings = typeof DEFAULT_SETTINGS;

type FSRSCustomState = {
  againDifficulty: number;
  againStability: number;
  hardDifficulty: number;
  hardStability: number;
  goodDifficulty: number;
  goodStability: number;
  easyDifficulty: number;
  easyStability: number;
};

const RATINGS = {
  AGAIN: 1,
  HARD: 2,
  GOOD: 3,
  EASY: 4,
};

const calculateFSRSInterval = (
  reviewInstance: SchedulerReviewInstance,
  grade: GradeRating,
  settings = DEFAULT_SETTINGS
): Interval | null => {
  const intervalModifier = Math.log(settings.requestRetention) / Math.log(0.9);
  const fuzzFactor = setFuzzFactor();

  const daysSinceLastReview = reviewInstance.lastReview
    ? daysBetween(reviewInstance.lastReview, new Date())
    : 0;

  const againIntervalSM2 = calculateSM2Interval(reviewInstance, "AGAIN");
  const hardIntervalSM2 = calculateSM2Interval(reviewInstance, "HARD");

  switch (reviewInstance.learningStatus) {
    case "UNSEEN":
    case "LEARNING":
    case "RELEARNING": {
      let customData = reviewInstance.customData as FSRSCustomState | null;
      if (!customData || isEmpty(customData)) {
        customData = initStates(settings);
      }

      const goodIntervalDays = nextIntervalDays(
        customData.goodStability,
        intervalModifier,
        settings,
        fuzzFactor
      );
      const easyIntervalDays = Math.max(
        nextIntervalDays(
          customData.easyStability * settings.easyBonus,
          intervalModifier,
          settings,
          fuzzFactor
        ),
        goodIntervalDays + 1
      );

      switch (grade) {
        case "AGAIN":
          return againIntervalSM2;
        case "HARD":
          return hardIntervalSM2;
        case "GOOD":
          return {
            minutes: goodIntervalDays * daysToMinutes,
            updatedReviewInstance: {
              customData,
              learningStatus:
                reviewInstance.stepsIndex + 1 < settings.NEW_STEPS.length
                  ? "LEARNING"
                  : "LEARNED",
              stepsIndex: reviewInstance.stepsIndex + 1,
              nextReview: inDays(goodIntervalDays),
            },
          };
        case "EASY":
          return {
            minutes: easyIntervalDays * daysToMinutes,
            updatedReviewInstance: {
              customData,
              learningStatus: "LEARNED",
              nextReview: inDays(easyIntervalDays),
            },
          };
      }

      break;
    }
    case "LEARNED": {
      let customData = reviewInstance.customData as FSRSCustomState | null;
      if (!customData || isEmpty(customData)) {
        customData = convertStates(reviewInstance, settings);
      }

      const lastD = customData.againDifficulty;
      const lastS = customData.againStability;
      const retrievability = Math.exp(
        (Math.log(0.9) * daysSinceLastReview) / lastS
      );

      // Update the custom state with new calculations
      customData = {
        againDifficulty: nextDifficulty(lastD, "AGAIN", settings),
        againStability: nextForgetStability(
          customData.againDifficulty,
          lastS,
          retrievability,
          settings
        ),
        hardDifficulty: nextDifficulty(lastD, "HARD", settings),
        hardStability: nextRecallStability(
          customData.hardDifficulty,
          lastS,
          retrievability,
          settings
        ),
        goodDifficulty: nextDifficulty(lastD, "GOOD", settings),
        goodStability: nextRecallStability(
          customData.goodDifficulty,
          lastS,
          retrievability,
          settings
        ),
        easyDifficulty: nextDifficulty(lastD, "EASY", settings),
        easyStability: nextRecallStability(
          customData.easyDifficulty,
          lastS,
          retrievability,
          settings
        ),
      };

      let hardIntervalDays = nextIntervalDays(
        lastS * settings.hardInterval,
        intervalModifier,
        settings,
        fuzzFactor
      );
      let goodIntervalDays = nextIntervalDays(
        customData.goodStability,
        intervalModifier,
        settings,
        fuzzFactor
      );
      let easyIntervalDays = nextIntervalDays(
        customData.easyStability * settings.easyBonus,
        intervalModifier,
        settings,
        fuzzFactor
      );
      hardIntervalDays = Math.min(hardIntervalDays, goodIntervalDays);
      goodIntervalDays = Math.max(goodIntervalDays, hardIntervalDays + 1);
      easyIntervalDays = Math.max(easyIntervalDays, goodIntervalDays + 1);

      switch (grade) {
        case "AGAIN":
          return againIntervalSM2;
        case "HARD":
          return {
            minutes: hardIntervalDays * daysToMinutes,
            updatedReviewInstance: {
              customData,
              nextReview: inDays(hardIntervalDays),
            },
          };
        case "GOOD":
          return {
            minutes: goodIntervalDays * daysToMinutes,
            updatedReviewInstance: {
              customData,
              nextReview: inDays(goodIntervalDays),
            },
          };
        case "EASY":
          return {
            minutes: easyIntervalDays * daysToMinutes,
            updatedReviewInstance: {
              customData,
              nextReview: inDays(easyIntervalDays),
            },
          };
      }
    }
  }

  return null;
};

export default calculateFSRSInterval;

// Set the fuzz factor that will be applied to all intervals
// Random number from 0-1
function setFuzzFactor(): number {
  // Original uses seeded random https://github.com/davidbau/seedrandom
  const fuzzFactor = Math.random();

  // Original saves seed in the card's `customData`

  return fuzzFactor;
}

// Fix a number to two decimal places
function fixDecimals(number: number): number {
  return Math.round(number * 100) / 100;
}

// Constraint the difficulty between 1 and 10
function constrainDifficulty(difficulty: number): number {
  return Math.min(Math.max(fixDecimals(difficulty), 1), 10);
}

// Initialize the difficulty for a card
// I do not understand this function
function initDifficulty(rating: GradeRating, settings: FSRSSettings): number {
  return fixDecimals(
    constrainDifficulty(settings.w[2] + settings.w[3] * (RATINGS[rating] - 3))
  );
}

// Initialize the stability for a card
// I do not understand this function
function initStability(rating: GradeRating, settings: FSRSSettings): number {
  return fixDecimals(
    Math.max(settings.w[0] + settings.w[1] * (RATINGS[rating] - 1), 0.1)
  );
}

// Initialize the `customData` states for a review instance
function initStates(settings: FSRSSettings): FSRSCustomState {
  return {
    againDifficulty: initDifficulty("AGAIN", settings),
    againStability: initStability("AGAIN", settings),
    hardDifficulty: initDifficulty("HARD", settings),
    hardStability: initStability("HARD", settings),
    goodDifficulty: initDifficulty("GOOD", settings),
    goodStability: initStability("GOOD", settings),
    easyDifficulty: initDifficulty("EASY", settings),
    easyStability: initStability("EASY", settings),
  };
}

// Convert the previous SM2-like states to be compatible with FSRS
function convertStates(
  reviewInstance: SchedulerReviewInstance,
  settings: FSRSSettings
): FSRSCustomState {
  // Adapted from Anki's `states.current.normal.review.scheduledDays`
  const scheduledDays = reviewInstance.lastReview
    ? daysBetween(reviewInstance.lastReview, reviewInstance.nextReview)
    : 0;
  const oldStability = fixDecimals(Math.max(scheduledDays, 0.1));
  const oldDifficulty = constrainDifficulty(
    11 -
      (reviewInstance.ease - 1) /
        (Math.exp(settings.w[6]) *
          Math.pow(oldStability, settings.w[7]) *
          (Math.exp(0.1 * settings.w[8]) - 1))
  );

  return {
    againDifficulty: oldDifficulty,
    againStability: oldStability,
    hardDifficulty: oldDifficulty,
    hardStability: oldStability,
    goodDifficulty: oldDifficulty,
    goodStability: oldStability,
    easyDifficulty: oldDifficulty,
    easyStability: oldStability,
  };
}

// Returns the number of days until the review instance should be seen again
function nextIntervalDays(
  stability: number,
  intervalModifier: number,
  settings: FSRSSettings,
  fuzzFactor: number
): number {
  const newInterval = applyFuzz(
    stability * intervalModifier,
    settings,
    fuzzFactor
  );
  return Math.min(
    Math.max(Math.round(newInterval), 1),
    settings.maximumInterval
  );
}

// Calculate the next difficulty from the old difficulty given a new grade rating
function nextDifficulty(
  oldDifficulty: number,
  rating: GradeRating,
  settings: FSRSSettings
): number {
  const nextD = oldDifficulty + settings.w[4] * (RATINGS[rating] - 3);
  return constrainDifficulty(meanReversion(settings.w[2], nextD, settings));
}

// Idk what this function does
function meanReversion(
  init: number,
  current: number,
  settings: FSRSSettings
): number {
  return settings.w[5] * init + (1 - settings.w[5]) * current;
}

// Calculate the next recall stability?
function nextRecallStability(
  difficulty: number,
  stability: number,
  retrievability: number,
  settings: FSRSSettings
): number {
  return fixDecimals(
    stability *
      (1 +
        Math.exp(settings.w[6]) *
          (11 - difficulty) *
          Math.pow(stability, settings.w[7]) *
          (Math.exp((1 - retrievability) * settings.w[8]) - 1))
  );
}

// Calculate the next forget stability?
function nextForgetStability(
  difficulty: number,
  stability: number,
  retrievability: number,
  settings: FSRSSettings
): number {
  return fixDecimals(
    settings.w[9] *
      Math.pow(difficulty, settings.w[10]) *
      Math.pow(stability, settings.w[11]) *
      Math.exp((1 - retrievability) * settings.w[12])
  );
}

// Applies fuzz to an interval
function applyFuzz(
  intervalDays: number,
  settings: FSRSSettings,
  fuzzFactor: number
): number {
  if (!settings.enableFuzz || intervalDays < 2.5) return intervalDays;
  intervalDays = Math.round(intervalDays);
  const minInterval = Math.max(2, Math.round(intervalDays * 0.95 - 1));
  const maxInterval = Math.round(intervalDays * 1.05 + 1);
  return Math.floor(fuzzFactor * (maxInterval - minInterval + 1) + minInterval);
}

// Returns true if the review instance has not been initialized with `customData`
function isEmpty(state: FSRSCustomState): boolean {
  return !(
    state.againDifficulty &&
    state.againStability &&
    state.hardDifficulty &&
    state.hardStability &&
    state.goodDifficulty &&
    state.goodStability &&
    state.easyDifficulty &&
    state.easyStability
  );
}
