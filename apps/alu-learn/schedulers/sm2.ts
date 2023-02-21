import { daysToMinutes, inDays, inMinutes } from "./helpers";
import clamp from "helpers-lib/src/clamp";
import daysBetween from "helpers-lib/src/daysBetween";
import type { GradeRating, Interval, SchedulerReviewInstance } from "@/types";

// const ANKI_SETTINGS = {
//   // "New Cards" tab
//   NEW_STEPS: [1, 10], // in minutes
//   GRADUATING_INTERVAL: 1, // in days
//   EASY_INTERVAL: 4, // in days

//   // "Reviews" tab
//   EASY_BONUS: 130, // in percent
//   INTERVAL_MODIFIER: 100, // in percent
//   MAXIMUM_INTERVAL: 36500, // in days

//   // "Lapses" tab
//   LAPSES_STEPS: [10], // in minutes
//   NEW_INTERVAL: 70, // in percent

//   // Other
//   MIN_EASE_FACTOR: 130,
//   MAX_EASE_FACTOR: 350,
//   FUZZ: 0, // in percent
// }

// https://www.youtube.com/watch?v=wvF5Y2101Lk
const ANKING_SETTINGS = {
  // "New Cards" tab
  NEW_STEPS: [25, 1440], // in minutes
  GRADUATING_INTERVAL: 3, // in days
  EASY_INTERVAL: 4, // in days

  // "Reviews" tab
  EASY_BONUS: 150, // in percent
  INTERVAL_MODIFIER: 100, // in percent
  MAXIMUM_INTERVAL: 36500, // in days

  // "Lapses" tab
  LAPSES_STEPS: [30, 1440], // in minutes
  NEW_INTERVAL: 20, // in percent

  // Other
  MIN_EASE_FACTOR: 130,
  MAX_EASE_FACTOR: 350,
  FUZZ: 0, // in percent
};

const calculateSM2Interval = (
  reviewInstance: SchedulerReviewInstance,
  grade: GradeRating,
  settings = ANKING_SETTINGS
): Interval | null => {
  const daysSinceLastReview = reviewInstance.lastReview
    ? daysBetween(reviewInstance.lastReview, new Date())
    : 0;

  const MINIMUM_REMEMBERED_INTERVAL = reviewInstance.lastReview
    ? Math.max(
        Math.floor(
          daysBetween(reviewInstance.lastReview, reviewInstance.nextReview)
        ),
        0
      )
    : 0;

  switch (reviewInstance.learningStatus) {
    case "UNSEEN":
    case "LEARNING":
      switch (grade) {
        case "AGAIN": {
          const minutes = settings.NEW_STEPS[0];
          return {
            minutes,
            updatedReviewInstance: {
              learningStatus: "LEARNING",
              stepsIndex: 0,
              nextReview: inMinutes(minutes),
            },
          };
        }
        case "HARD":
          return null;
        case "GOOD":
          if (reviewInstance.stepsIndex + 1 < settings.NEW_STEPS.length) {
            const minutes = settings.NEW_STEPS[reviewInstance.stepsIndex + 1];
            return {
              minutes,
              updatedReviewInstance: {
                learningStatus: "LEARNING",
                stepsIndex: reviewInstance.stepsIndex + 1,
                nextReview: inMinutes(minutes),
              },
            };
          } else {
            return {
              minutes: settings.GRADUATING_INTERVAL * daysToMinutes,
              updatedReviewInstance: {
                learningStatus: "LEARNED",
                nextReview: inDays(settings.GRADUATING_INTERVAL),
              },
            };
          }
        case "EASY":
          return {
            minutes: settings.EASY_INTERVAL * daysToMinutes,
            updatedReviewInstance: {
              learningStatus: "LEARNED",
              nextReview: inDays(settings.EASY_INTERVAL),
            },
          };
      }
      break;
    case "LEARNED":
      switch (grade) {
        case "AGAIN": {
          const minutes = settings.LAPSES_STEPS[0];
          return {
            minutes,
            updatedReviewInstance: {
              learningStatus: "RELEARNING",
              stepsIndex: 0,
              ease: Math.max(
                settings.MIN_EASE_FACTOR,
                reviewInstance.ease - 20
              ),
              nextReview: inMinutes(minutes),
            },
          };
        }
        case "HARD": {
          const interval = clamp(
            (daysSinceLastReview * 1.2 * settings.INTERVAL_MODIFIER) / 100,
            MINIMUM_REMEMBERED_INTERVAL,
            settings.MAXIMUM_INTERVAL
          );
          return {
            minutes: interval * daysToMinutes,
            updatedReviewInstance: {
              ease: Math.max(
                settings.MIN_EASE_FACTOR,
                reviewInstance.ease - 15
              ),
              nextReview: inDays(interval),
            },
          };
        }
        case "GOOD": {
          const interval = clamp(
            (((daysSinceLastReview * reviewInstance.ease) / 100) *
              settings.INTERVAL_MODIFIER) /
              100,
            MINIMUM_REMEMBERED_INTERVAL,
            settings.MAXIMUM_INTERVAL
          );
          return {
            minutes: interval * daysToMinutes,
            updatedReviewInstance: {
              nextReview: inDays(interval),
            },
          };
        }
        case "EASY": {
          const interval = clamp(
            (((((daysSinceLastReview * reviewInstance.ease) / 100) *
              settings.EASY_BONUS) /
              100) *
              settings.INTERVAL_MODIFIER) /
              100,
            MINIMUM_REMEMBERED_INTERVAL,
            settings.MAXIMUM_INTERVAL
          );
          return {
            minutes: interval * daysToMinutes,
            updatedReviewInstance: {
              ease: reviewInstance.ease + 15,
              nextReview: inDays(interval),
            },
          };
        }
      }
      break;
    case "RELEARNING":
      switch (grade) {
        case "AGAIN": {
          const minutes = settings.LAPSES_STEPS[0];
          return {
            minutes,
            updatedReviewInstance: {
              stepsIndex: 0,
              nextReview: inMinutes(minutes),
            },
          };
        }
        case "HARD":
          return null;
        case "GOOD":
          if (reviewInstance.stepsIndex + 1 < settings.LAPSES_STEPS.length) {
            const minutes =
              settings.LAPSES_STEPS[reviewInstance.stepsIndex + 1];
            return {
              minutes,
              updatedReviewInstance: {
                stepsIndex: reviewInstance.stepsIndex + 1,
                nextReview: inMinutes(minutes),
              },
            };
          } else {
            return {
              minutes: daysSinceLastReview * daysToMinutes,
              updatedReviewInstance: {
                learningStatus: "LEARNED",
                nextReview: inDays(daysSinceLastReview),
              },
            };
          }
        case "EASY":
          return null;
      }
  }

  return null;
};

export default calculateSM2Interval;
